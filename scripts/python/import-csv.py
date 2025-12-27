"""
CSV 파일을 PostgreSQL DB에 import하는 스크립트

사용법:
    python import-csv.py --csv ../../badmintongame_2025_12.csv
    python import-csv.py --csv ../../badmintongame_2025_12.csv --dry-run
"""

from __future__ import annotations

import argparse
import csv
import os
import re
from datetime import datetime
from typing import Optional, Tuple
from urllib.parse import urlparse

import psycopg2
from dotenv import load_dotenv


def parse_korean_date(date_str: str) -> Optional[datetime]:
    """'2025년 12월 14일' 형식을 datetime으로 변환"""
    if not date_str:
        return None

    # 0000년 0월 0일 같은 잘못된 날짜 처리
    if "0000년" in date_str:
        return None

    match = re.search(r"(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일", date_str)
    if match:
        year, month, day = map(int, match.groups())
        try:
            return datetime(year, month, day)
        except ValueError:
            return None
    return None


def parse_period(period_str: str) -> Tuple[Optional[datetime], Optional[datetime]]:
    """'2025년 12월 13일 ~ 2025년 12월 14일' 형식을 파싱"""
    if not period_str:
        return None, None

    parts = re.split(r"\s*~\s*", period_str)
    start_date = parse_korean_date(parts[0]) if len(parts) > 0 else None
    end_date = parse_korean_date(parts[1]) if len(parts) > 1 else start_date

    return start_date, end_date


def get_db_connection(database_url: str):
    """DATABASE_URL로 PostgreSQL 연결"""
    return psycopg2.connect(database_url)


def import_csv_to_db(csv_path: str, database_url: str, dry_run: bool = False):
    """CSV 파일을 DB에 import"""

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"[INFO] CSV에서 {len(rows)}개 레코드 읽음")

    if dry_run:
        print("[DRY-RUN] 실제 DB에 넣지 않고 미리보기만 합니다.\n")

    conn = None
    cursor = None

    if not dry_run:
        conn = get_db_connection(database_url)
        cursor = conn.cursor()

    inserted = 0
    skipped = 0

    for row in rows:
        # 날짜 파싱
        start_date, end_date = parse_period(row.get("event_period", ""))
        apply_start, apply_end = parse_period(row.get("apply_period", ""))

        # 필수 필드 체크
        name = row.get("title", "").strip()
        if not name or not start_date or not end_date:
            print(f"[SKIP] 필수 필드 누락: ga_id={row.get('ga_id')}, name={name}")
            skipped += 1
            continue

        record = {
            "name": name,
            "startDate": start_date,
            "endDate": end_date,
            "applyStartDate": apply_start,
            "applyEndDate": apply_end,
            "region": row.get("region") or None,
            "location": row.get("venue") or None,
            "tournamentUrl": row.get("url") or None,
            "platform": None,
        }

        if dry_run:
            print(f"[PREVIEW] {record['name']}")
            print(f"          기간: {record['startDate']} ~ {record['endDate']}")
            print(f"          신청: {record['applyStartDate']} ~ {record['applyEndDate']}")
            print(f"          지역: {record['region']}, 장소: {record['location']}")
            print()
            inserted += 1
        else:
            # DB INSERT
            sql = """
                INSERT INTO "Tournament"
                    (name, "startDate", "endDate", "applyStartDate", "applyEndDate",
                     region, location, "tournamentUrl", platform, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """
            cursor.execute(sql, (
                record["name"],
                record["startDate"],
                record["endDate"],
                record["applyStartDate"],
                record["applyEndDate"],
                record["region"],
                record["location"],
                record["tournamentUrl"],
                record["platform"],
            ))
            inserted += 1
            print(f"[INSERT] {record['name']}")

    if conn and not dry_run:
        conn.commit()
        cursor.close()
        conn.close()

    print(f"\n[DONE] 삽입: {inserted}, 스킵: {skipped}")


def main():
    ap = argparse.ArgumentParser(description="CSV를 DB에 import")
    ap.add_argument("--csv", required=True, help="CSV 파일 경로")
    ap.add_argument("--dry-run", action="store_true", help="실제 DB에 넣지 않고 미리보기만")
    args = ap.parse_args()

    # .env 파일 로드 (프로젝트 루트 기준)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(script_dir, "..", "..")
    env_path = os.path.join(project_root, ".env")

    load_dotenv(env_path)

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("[ERROR] DATABASE_URL 환경변수가 없습니다. .env 파일을 확인하세요.")
        return

    import_csv_to_db(args.csv, database_url, args.dry_run)


if __name__ == "__main__":
    main()
