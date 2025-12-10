"""Google Places API 테스트 스크립트

googlemaps 라이브러리를 직접 사용하여 API 동작을 테스트합니다.
"""
import os
import sys
from pathlib import Path

# .env 로드
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

import googlemaps

# 환경변수에서 인증 정보 가져오기
_credential = os.getenv("GOOGLE_MAP_API_KEY") or os.getenv("GOOGLE_API_KEY")


def print_separator(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_search_places(gmaps):
    """장소 검색 테스트"""
    print_separator("1. search_places 테스트")

    query = "서울 홍대 카페"
    results = gmaps.places(query=query, language="ko")

    print(f"검색어: {query}")
    print(f"상태: {results.get('status')}")
    print(f"결과 수: {len(results.get('results', []))}")
    print("\n장소 목록:")

    place_id = None
    for i, place in enumerate(results.get("results", [])[:5], 1):
        print(f"\n  [{i}] {place.get('name')}")
        print(f"      주소: {place.get('formatted_address')}")
        print(f"      평점: {place.get('rating')} ({place.get('user_ratings_total', 0)}개 리뷰)")
        print(f"      타입: {', '.join(place.get('types', [])[:3])}")

        pid = place.get('place_id', '')
        print(f"      place_id: {pid[:40]}...")

        if i == 1:
            place_id = pid

    return place_id


def test_get_place_details(gmaps, place_id: str):
    """장소 상세 정보 테스트"""
    print_separator("2. get_place_details 테스트")

    if not place_id:
        print("place_id가 없어서 스킵합니다.")
        return

    result = gmaps.place(
        place_id=place_id,
        language="ko",
        fields=[
            "name",
            "formatted_address",
            "formatted_phone_number",
            "website",
            "rating",
            "user_ratings_total",
            "reviews",
            "opening_hours",
            "price_level",
            "type",
            "photo",
        ]
    )

    place = result.get("result", {})

    print(f"장소명: {place.get('name')}")
    print(f"주소: {place.get('formatted_address')}")
    print(f"전화번호: {place.get('formatted_phone_number')}")
    print(f"웹사이트: {place.get('website')}")
    print(f"평점: {place.get('rating')} ({place.get('user_ratings_total', 0)}개 리뷰)")
    print(f"가격대: {'$' * (place.get('price_level') or 0) or 'N/A'}")

    opening_hours = place.get("opening_hours", {})
    if opening_hours.get("weekday_text"):
        print("\n영업시간:")
        for hours in opening_hours.get("weekday_text", [])[:3]:
            print(f"  {hours}")

    reviews = place.get("reviews", [])
    if reviews:
        print("\n최근 리뷰:")
        for review in reviews[:2]:
            text = review.get('text', '')[:80]
            print(f"  - {review.get('author_name')}: {text}...")

    photos = place.get("photos", [])
    print(f"\n사진 수: {len(photos)}개")


def test_search_nearby_places(gmaps):
    """주변 장소 검색 테스트"""
    print_separator("3. search_nearby_places 테스트")

    # 서울 홍대입구역 좌표
    location = (37.5571, 126.9252)
    radius = 500

    results = gmaps.places_nearby(
        location=location,
        radius=radius,
        type="cafe",
        language="ko",
    )

    print(f"중심 좌표: {location}")
    print(f"검색 반경: {radius}m")
    print(f"상태: {results.get('status')}")
    print(f"결과 수: {len(results.get('results', []))}")
    print("\n주변 카페:")

    for i, place in enumerate(results.get("results", [])[:5], 1):
        print(f"\n  [{i}] {place.get('name')}")
        print(f"      주소: {place.get('vicinity')}")
        print(f"      평점: {place.get('rating')}")


def test_geocode_address(gmaps):
    """주소 -> 좌표 변환 테스트"""
    print_separator("4. geocode_address 테스트")

    address = "서울특별시 마포구 양화로 160"
    results = gmaps.geocode(address, language="ko")

    if not results:
        print(f"Error: 주소를 찾을 수 없습니다 - {address}")
        return

    result = results[0]
    location = result.get("geometry", {}).get("location", {})

    print(f"입력 주소: {address}")
    print(f"포맷된 주소: {result.get('formatted_address')}")
    print(f"좌표: lat={location.get('lat')}, lng={location.get('lng')}")
    print(f"place_id: {result.get('place_id')}")


def test_reverse_geocode(gmaps):
    """좌표 -> 주소 변환 테스트"""
    print_separator("5. reverse_geocode 테스트")

    location = (37.5571, 126.9252)  # 홍대입구역
    results = gmaps.reverse_geocode(location, language="ko")

    if not results:
        print(f"Error: 주소를 찾을 수 없습니다")
        return

    result = results[0]

    print(f"입력 좌표: lat={location[0]}, lng={location[1]}")
    print(f"포맷된 주소: {result.get('formatted_address')}")
    print(f"place_id: {result.get('place_id')}")


def main():
    print("\n" + "="*60)
    print("  Google Places API 테스트")
    print("="*60)

    # 인증 확인
    if not _credential:
        print("\n[ERROR] Google Places 인증 정보가 설정되지 않았습니다.")
        print("        .env 파일에 GOOGLE_MAP 관련 키를 설정하세요.")
        return

    print(f"\n[OK] 인증 설정됨: {_credential[:15]}...")

    try:
        # Google Maps 클라이언트 초기화
        gmaps = googlemaps.Client(key=_credential)
        print(f"[OK] Google Maps 클라이언트 초기화 완료")

        # 1. 장소 검색
        place_id = test_search_places(gmaps)

        # 2. 장소 상세 정보
        test_get_place_details(gmaps, place_id)

        # 3. 주변 장소 검색
        test_search_nearby_places(gmaps)

        # 4. Geocoding
        test_geocode_address(gmaps)

        # 5. Reverse Geocoding
        test_reverse_geocode(gmaps)

        print_separator("테스트 완료")
        print("모든 테스트가 성공적으로 완료되었습니다!")

    except Exception as e:
        print(f"\n[ERROR] 테스트 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
