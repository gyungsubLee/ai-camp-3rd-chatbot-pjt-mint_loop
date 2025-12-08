"""Google Places MCP Server - 장소 검색 및 상세 정보 조회"""
import os
from typing import Any, Optional
from pathlib import Path

from dotenv import load_dotenv


# .env 파일을 현재 디렉토리 및 상위 디렉토리에서 검색
def find_and_load_dotenv():
    """Find and load .env file from current or parent directories"""
    current = Path(__file__).resolve().parent
    for _ in range(5):  # Check up to 5 parent directories
        env_file = current / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            return True
        current = current.parent
    # Fallback to default behavior
    load_dotenv()
    return False


find_and_load_dotenv()

import structlog
from fastmcp import FastMCP
import googlemaps

logger = structlog.get_logger(__name__)

# FastMCP 서버 초기화
mcp = FastMCP("PlacesMCP")

# 환경변수 키 이름 (동적 구성)
_PLACES_ENV_VAR = "GOOGLE_MAP_API_KEY"

# Google Maps 클라이언트 초기화
_places_credential = os.getenv(_PLACES_ENV_VAR)

if not _places_credential:
    logger.warning(f"{_PLACES_ENV_VAR} not found, Places API will not work")
    gmaps = None
else:
    gmaps = googlemaps.Client(key=_places_credential)
    logger.info("Google Maps client initialized")


@mcp.tool()
async def search_places(
    query: str,
    location: Optional[str] = None,
    language: str = "ko",
    max_results: int = 10
) -> dict[str, Any]:
    """텍스트 기반 장소 검색

    Args:
        query: 검색할 장소 텍스트 (예: "서울 카페", "파리 에펠탑 근처 레스토랑")
        location: 중심 위치 (예: "37.5665,126.9780" 또는 "Seoul, Korea")
        language: 결과 언어 (기본값: ko)
        max_results: 최대 결과 수 (기본값: 10, 최대: 20)

    Returns:
        dict: 검색 결과
            - places: 장소 목록 (id, name, address, rating, types, location)
            - total: 총 결과 수
    """
    if not gmaps:
        return {"error": "Google Places API가 설정되지 않았습니다", "places": []}

    try:
        logger.info(f"Searching places: {query}", location=location)

        # 텍스트 검색 실행
        results = gmaps.places(
            query=query,
            language=language,
        )

        places = []
        for place in results.get("results", [])[:max_results]:
            places.append({
                "place_id": place.get("place_id"),
                "name": place.get("name"),
                "address": place.get("formatted_address"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "types": place.get("types", []),
                "location": place.get("geometry", {}).get("location"),
                "business_status": place.get("business_status"),
                "price_level": place.get("price_level"),
                "photo_reference": (
                    place.get("photos", [{}])[0].get("photo_reference")
                    if place.get("photos")
                    else None
                ),
            })

        logger.info(f"Found {len(places)} places")
        return {
            "places": places,
            "total": len(places),
            "query": query,
        }

    except Exception as e:
        logger.error(f"Place search failed: {e}")
        return {
            "places": [],
            "total": 0,
            "error": str(e),
        }


@mcp.tool()
async def get_place_details(
    place_id: str,
    language: str = "ko"
) -> dict[str, Any]:
    """장소 상세 정보 조회

    Args:
        place_id: Google Places ID (search_places에서 반환된 place_id)
        language: 결과 언어 (기본값: ko)

    Returns:
        dict: 장소 상세 정보
            - name, address, phone, website, opening_hours, reviews 등
    """
    if not gmaps:
        return {"error": "Google Places API가 설정되지 않았습니다"}

    try:
        logger.info(f"Getting place details: {place_id}")

        result = gmaps.place(
            place_id=place_id,
            language=language,
            fields=[
                "name",
                "formatted_address",
                "formatted_phone_number",
                "international_phone_number",
                "website",
                "url",
                "rating",
                "user_ratings_total",
                "reviews",
                "opening_hours",
                "price_level",
                "type",
                "geometry",
                "photo",
                "editorial_summary",
            ]
        )

        place = result.get("result", {})

        # 사진 URL 목록 생성
        photos = []
        for photo in place.get("photos", [])[:5]:
            photo_ref = photo.get("photo_reference")
            if photo_ref:
                photos.append({
                    "reference": photo_ref,
                    "width": photo.get("width"),
                    "height": photo.get("height"),
                })

        # 리뷰 정리
        reviews = []
        for review in place.get("reviews", [])[:5]:
            reviews.append({
                "author": review.get("author_name"),
                "rating": review.get("rating"),
                "text": review.get("text"),
                "time": review.get("relative_time_description"),
            })

        return {
            "place_id": place_id,
            "name": place.get("name"),
            "address": place.get("formatted_address"),
            "phone": place.get("formatted_phone_number"),
            "international_phone": place.get("international_phone_number"),
            "website": place.get("website"),
            "google_maps_url": place.get("url"),
            "rating": place.get("rating"),
            "user_ratings_total": place.get("user_ratings_total"),
            "price_level": place.get("price_level"),
            "types": place.get("types", []),
            "location": place.get("geometry", {}).get("location"),
            "opening_hours": place.get("opening_hours", {}).get("weekday_text", []),
            "is_open_now": place.get("opening_hours", {}).get("open_now"),
            "editorial_summary": place.get("editorial_summary", {}).get("overview"),
            "photos": photos,
            "reviews": reviews,
        }

    except Exception as e:
        logger.error(f"Get place details failed: {e}")
        return {"error": str(e), "place_id": place_id}


@mcp.tool()
async def search_nearby_places(
    location: str,
    radius: int = 1000,
    place_type: Optional[str] = None,
    keyword: Optional[str] = None,
    language: str = "ko",
    max_results: int = 10
) -> dict[str, Any]:
    """주변 장소 검색

    Args:
        location: 중심 좌표 "위도,경도" (예: "37.5665,126.9780")
        radius: 검색 반경 (미터, 기본값: 1000, 최대: 50000)
        place_type: 장소 타입 필터 (예: "restaurant", "cafe", "tourist_attraction")
        keyword: 검색 키워드 (선택사항)
        language: 결과 언어 (기본값: ko)
        max_results: 최대 결과 수 (기본값: 10)

    Returns:
        dict: 주변 장소 목록
    """
    if not gmaps:
        return {"error": "Google Places API가 설정되지 않았습니다", "places": []}

    try:
        # 위치 파싱
        lat, lng = map(float, location.split(","))
        logger.info(f"Searching nearby places", location=location, radius=radius, type=place_type)

        # 주변 검색 실행
        results = gmaps.places_nearby(
            location=(lat, lng),
            radius=min(radius, 50000),
            type=place_type,
            keyword=keyword,
            language=language,
        )

        places = []
        for place in results.get("results", [])[:max_results]:
            places.append({
                "place_id": place.get("place_id"),
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "types": place.get("types", []),
                "location": place.get("geometry", {}).get("location"),
                "business_status": place.get("business_status"),
                "price_level": place.get("price_level"),
                "photo_reference": (
                    place.get("photos", [{}])[0].get("photo_reference")
                    if place.get("photos")
                    else None
                ),
            })

        logger.info(f"Found {len(places)} nearby places")
        return {
            "places": places,
            "total": len(places),
            "center_location": {"lat": lat, "lng": lng},
            "radius": radius,
        }

    except ValueError:
        return {"error": "잘못된 위치 형식입니다. '위도,경도' 형식으로 입력하세요.", "places": []}
    except Exception as e:
        logger.error(f"Nearby search failed: {e}")
        return {"places": [], "error": str(e)}


@mcp.tool()
async def get_place_photo_url(
    photo_reference: str,
    max_width: int = 800,
    max_height: Optional[int] = None
) -> dict[str, Any]:
    """장소 사진 URL 생성

    Args:
        photo_reference: 사진 참조 ID (search_places 또는 get_place_details에서 반환)
        max_width: 최대 너비 (기본값: 800, 최대: 1600)
        max_height: 최대 높이 (선택사항)

    Returns:
        dict: 사진 URL 정보
            - url: 사진 URL
            - width: 요청된 최대 너비
    """
    if not _places_credential:
        return {"error": "Google Places API가 설정되지 않았습니다"}

    try:
        # Google Places Photo URL 구성
        base_url = "https://maps.googleapis.com/maps/api/place/photo"
        params = {
            "photoreference": photo_reference,
            "maxwidth": min(max_width, 1600),
            "key": _places_credential,
        }

        if max_height:
            params["maxheight"] = min(max_height, 1600)

        # URL 생성
        url = f"{base_url}?{'&'.join(f'{k}={v}' for k, v in params.items())}"

        return {
            "url": url,
            "max_width": params["maxwidth"],
            "max_height": params.get("maxheight"),
            "photo_reference": photo_reference,
        }

    except Exception as e:
        logger.error(f"Get photo URL failed: {e}")
        return {"error": str(e)}


@mcp.tool()
async def geocode_address(
    address: str,
    language: str = "ko"
) -> dict[str, Any]:
    """주소를 좌표로 변환 (Geocoding)

    Args:
        address: 주소 텍스트 (예: "서울특별시 중구 세종대로 110")
        language: 결과 언어 (기본값: ko)

    Returns:
        dict: 좌표 및 포맷된 주소
            - location: {lat, lng}
            - formatted_address: 포맷된 주소
    """
    if not gmaps:
        return {"error": "Google Places API가 설정되지 않았습니다"}

    try:
        logger.info(f"Geocoding address: {address}")

        results = gmaps.geocode(address, language=language)

        if not results:
            return {"error": "주소를 찾을 수 없습니다", "address": address}

        result = results[0]

        return {
            "location": result.get("geometry", {}).get("location"),
            "formatted_address": result.get("formatted_address"),
            "place_id": result.get("place_id"),
            "address_components": result.get("address_components", []),
            "types": result.get("types", []),
        }

    except Exception as e:
        logger.error(f"Geocoding failed: {e}")
        return {"error": str(e), "address": address}


@mcp.tool()
async def reverse_geocode(
    location: str,
    language: str = "ko"
) -> dict[str, Any]:
    """좌표를 주소로 변환 (Reverse Geocoding)

    Args:
        location: 좌표 "위도,경도" (예: "37.5665,126.9780")
        language: 결과 언어 (기본값: ko)

    Returns:
        dict: 주소 정보
            - formatted_address: 포맷된 주소
            - address_components: 주소 구성요소
    """
    if not gmaps:
        return {"error": "Google Places API가 설정되지 않았습니다"}

    try:
        lat, lng = map(float, location.split(","))
        logger.info(f"Reverse geocoding: {location}")

        results = gmaps.reverse_geocode((lat, lng), language=language)

        if not results:
            return {"error": "주소를 찾을 수 없습니다", "location": location}

        result = results[0]

        return {
            "location": {"lat": lat, "lng": lng},
            "formatted_address": result.get("formatted_address"),
            "place_id": result.get("place_id"),
            "address_components": result.get("address_components", []),
            "types": result.get("types", []),
        }

    except ValueError:
        return {"error": "잘못된 위치 형식입니다. '위도,경도' 형식으로 입력하세요."}
    except Exception as e:
        logger.error(f"Reverse geocoding failed: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    # MCP 서버 실행 (0.0.0.0으로 바인딩하여 Docker 네트워크에서 접근 가능)
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8052)
