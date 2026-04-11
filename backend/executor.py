import time
from mwrogue.esports_client import EsportsClient
from mwrogue.auth_credentials import AuthCredentials
from requests.exceptions import ReadTimeout


credentials = AuthCredentials(user_file="me")
site = EsportsClient("lol", credentials=credentials)


def exec_query(
    tables, fields, where=None, join_on=None, limit=None, group_by=None, order_by=None
):
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
    action="query", format="json", titles=None, prop="imageinfo", iiprop="url"
):
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
