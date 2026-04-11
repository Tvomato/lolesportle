import time
from typing import Any, Optional
from mwrogue.esports_client import EsportsClient
from mwrogue.auth_credentials import AuthCredentials
from requests.exceptions import ReadTimeout


credentials = AuthCredentials(user_file="me")
site = EsportsClient("lol", credentials=credentials)


def exec_query(
    tables: str,
    fields: str,
    where: Optional[str] = None,
    join_on: Optional[str] = None,
    limit: Optional[int] = None,
    group_by: Optional[str] = None,
    order_by: Optional[str] = None,
) -> list[dict[str, Any]]:
    max_retries = 3
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            res = site.cargo_client.query(
                tables=tables,
                fields=fields,
                where=where,
                join_on=join_on,
                limit=limit,
                group_by=group_by,
                order_by=order_by,
            )
            time.sleep(1)
            return res

        except ReadTimeout:
            if attempt < max_retries - 1:
                wait_time = retry_delay * (attempt + 1)
                print(
                    f"Query timed out, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})..."
                )
                time.sleep(wait_time)
            else:
                print(f"Query failed after {max_retries} attempts")
                raise


def exec_api(
    action: str = "query",
    format: str = "json",
    titles: Optional[str] = None,
    prop: str = "imageinfo",
    iiprop: str = "url",
) -> dict[str, Any]:
    max_retries = 3
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            res = site.client.api(
                action=action,
                format=format,
                titles=titles,
                prop=prop,
                iiprop=iiprop,
            )
            return res

        except ReadTimeout:
            if attempt < max_retries - 1:
                wait_time = retry_delay * (attempt + 1)
                print(
                    f"API read timeout, retrying in {wait_time}s, (attempt {attempt + 1}/{max_retries})..."
                )
                time.sleep(wait_time)
            else:
                print(f"API read failed after {max_retries} attempts, giving up")
                raise
