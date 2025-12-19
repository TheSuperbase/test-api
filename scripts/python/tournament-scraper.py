from __future__ import annotations

import argparse
import csv
import random
import re
import time
from dataclasses import dataclass, asdict
from typing import Dict, Optional, List, Tuple

import requests
from bs4 import BeautifulSoup

BASE = "http://www.badmintongame.co.kr"
DETAIL_URL = BASE + "/game/game_view.html?ga_id={ga_id}"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}


@dataclass
class Tournament:
    ga_id: int
    url: str
    title: Optional[str] = None
    event_period: Optional[str] = None  # "대회기간" 또는 "대회일시"
    apply_period: Optional[str] = None  # "접수기간"
    venue: Optional[str] = None         # "대회장소"
    region: Optional[str] = None        # "참가지역" 또는 "대회지역"
    phone: Optional[str] = None         # "전화번호"


def jitter_sleep(base: float, jitter: float):
    """서버 부하/차단 완화용 랜덤 딜레이"""
    time.sleep(max(0.0, base + random.uniform(-jitter, jitter)))


def fetch_detail_html(session: requests.Session, ga_id: int, timeout: int = 20) -> Optional[str]:
    url = DETAIL_URL.format(ga_id=ga_id)
    r = session.get(url, headers=HEADERS, timeout=timeout)

    # 사이트에 따라 404 대신 200 + "없는 글" 메시지일 수 있음
    if r.status_code in (404, 410):
        return None

    # 200이 아니면 스킵
    if r.status_code != 200:
        return None

    text = r.text or ""
    # 아주 간단한 "없는 페이지" 감지(사이트 문구가 다르면 필요 시 수정)
    if "존재하지" in text or "삭제" in text or "잘못된" in text:
        return None

    return text


def parse_th_td_kv(soup: BeautifulSoup) -> Dict[str, str]:
    kv: Dict[str, str] = {}
    for th in soup.find_all("th"):
        key = th.get_text(" ", strip=True)
        td = th.find_next("td")
        if not td:
            continue
        val = td.get_text(" ", strip=True)
        if key and val:
            kv[key] = val
    return kv


def extract_title(soup: BeautifulSoup) -> Optional[str]:
    title = None
    og = soup.find("meta", property="og:title")
    if og and og.get("content"):
        title = og["content"].strip()
    elif soup.title and soup.title.get_text(strip=True):
        title = soup.title.get_text(" ", strip=True)
    else:
        # fallback
        for tag in ["h1", "h2", "h3"]:
            h = soup.find(tag)
            if h and h.get_text(strip=True):
                title = h.get_text(" ", strip=True)
                break
    
    # "| 전국배드민턴대회" 제거
    if title:
        title = re.sub(r"\s*\|\s*전국배드민턴대회\s*$", "", title).strip()
    
    return title


def normalize_period_text(period: str) -> str:
    """공백/특수문자 정리(필터링 정확도를 약간 올림)"""
    period = period.replace("~", "~")
    period = re.sub(r"\s+", " ", period).strip()
    return period


def extract_event_period(soup: BeautifulSoup, kv: Dict[str, str]) -> Optional[str]:
    # 1) 기존 방식 (th/td)
    period = kv.get("대회기간") or kv.get("대회일시") or kv.get("대회 일시")
    if period:
        return normalize_period_text(period)

    # 2) fallback: 페이지 전체 텍스트에서 라벨 라인 찾기
    text = soup.get_text("\n", strip=True)

    # "대회기간: 2025년 12월 5일 ..." 같은 라인
    m = re.search(r"(?:대회기간|대회일시|대회 일시)\s*[:：]?\s*([^\n\r]+)", text)
    if m:
        return normalize_period_text(m.group(1))

    return None


def period_matches_year_month(period: str, year: int, month: int) -> bool:
    if not period:
        return False

    # 1) 2025-12 / 2025.12 / 2025/12
    pat_numeric = rf"{year}[./-]\s*{month:02d}\b|{year}[./-]\s*{month}\b"

    # 2) 2025년 12월 (공백/0패딩/표기 흔들림 대응)
    pat_korean = rf"{year}\s*년\s*0*{month}\s*월"

    return re.search(pat_numeric, period) is not None or re.search(pat_korean, period) is not None


def period_matches_year(period: str, year: int) -> bool:
    """period 문자열 안에 YYYY가 포함되면 매칭"""
    if not period:
        return False
    return str(year) in period


def scrape_range(
    start_id: int,
    end_id: int,
    year: int,
    month: int | None,
    delay: float,
    jitter: float,
    max_hits: int | None = None,
) -> List[Tournament]:
    items: List[Tournament] = []
    with requests.Session() as session:
        for ga_id in range(start_id, end_id + 1):
            html = None
            try:
                html = fetch_detail_html(session, ga_id)
            except Exception:
                html = None

            if not html:
                jitter_sleep(delay, jitter)
                continue

            soup = BeautifulSoup(html, "lxml")
            kv = parse_th_td_kv(soup)

            period = extract_event_period(soup, kv)

            # 필터: 월별 or 연도별
            ok = False
            if month is not None:
                ok = period_matches_year_month(period or "", year, month)
            else:
                ok = period_matches_year(period or "", year)

            if ok:
                url = DETAIL_URL.format(ga_id=ga_id)
                t = Tournament(
                    ga_id=ga_id,
                    url=url,
                    title=extract_title(soup),
                    event_period=period,
                    apply_period=kv.get("접수기간"),
                    venue=kv.get("대회장소"),
                    region=kv.get("참가지역") or kv.get("대회지역"),
                    phone=kv.get("전화번호"),
                )
                items.append(t)
                print(f"[HIT] ga_id={ga_id} period={t.event_period} title={t.title}")

                if max_hits is not None and len(items) >= max_hits:
                    break

            jitter_sleep(delay, jitter)

    return items


def save_csv(items: List[Tournament], out_path: str):
    if not items:
        print("[SAVE] no items to save.")
        return

    with open(out_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(asdict(items[0]).keys()))
        w.writeheader()
        for it in items:
            w.writerow(asdict(it))
    print(f"[SAVE] {out_path} (count={len(items)})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--end-id", type=int, required=True, help="마지막 ga_id (예: 4137)")
    ap.add_argument("--start-id", type=int, default=1)
    ap.add_argument("--year", type=int, required=True, help="예: 2025")
    ap.add_argument("--month", type=int, default=0, help="월별이면 1~12, 연도 전체면 0")
    ap.add_argument("--out", type=str, default="")
    ap.add_argument("--delay", type=float, default=0.25, help="기본 딜레이(초)")
    ap.add_argument("--jitter", type=float, default=0.10, help="딜레이 랜덤폭(초)")
    ap.add_argument("--max-hits", type=int, default=0, help="테스트용: 매칭 n개만 수집(0=제한없음)")
    args = ap.parse_args()

    month = args.month if args.month else None
    max_hits = args.max_hits if args.max_hits else None

    out = args.out
    if not out:
        out = f"badmintongame_{args.year}_{args.month:02d}.csv" if month else f"badmintongame_{args.year}.csv"

    items = scrape_range(
        start_id=args.start_id,
        end_id=args.end_id,
        year=args.year,
        month=month,
        delay=args.delay,
        jitter=args.jitter,
        max_hits=max_hits,
    )

    save_csv(items, out)


if __name__ == "__main__":
    main()