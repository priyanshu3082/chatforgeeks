import os
import pandas as pd
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bi_dashboard.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_sample_data():
    """Seed the database with a demo sales dataset."""
    import random
    from datetime import date, timedelta

    regions = ["North", "South", "East", "West", "Central"]
    categories = ["Electronics", "Clothing", "Food & Beverages", "Home & Garden", "Sports"]

    rows = []
    start_date = date(2023, 1, 1)
    random.seed(42)

    for i in range(1000):
        d = start_date + timedelta(days=random.randint(0, 364))
        region = random.choice(regions)
        category = random.choice(categories)
        revenue = round(random.uniform(500, 50000), 2)
        profit = round(revenue * random.uniform(0.1, 0.45), 2)
        customers = random.randint(10, 500)
        discount = round(random.uniform(0.0, 0.35), 2)
        rows.append({
            "id": i + 1,
            "date": d.isoformat(),
            "month": d.strftime("%B"),
            "quarter": f"Q{(d.month - 1) // 3 + 1}",
            "year": d.year,
            "region": region,
            "product_category": category,
            "revenue": revenue,
            "profit": profit,
            "customer_count": customers,
            "discount_percentage": discount,
        })

    df = pd.DataFrame(rows)

    with engine.connect() as conn:
        # Check if table exists and has data
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "sales" in tables:
            result = conn.execute(text("SELECT COUNT(*) FROM sales"))
            count = result.scalar()
            if count > 0:
                print("Sample data already exists, skipping seed.")
                return

    df.to_sql("sales", engine, if_exists="replace", index=False)
    print(f"Seeded {len(df)} rows into 'sales' table.")


def get_schema_info(table_name: str = None) -> dict:
    """Get schema information for all tables or a specific table."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    schema = {}

    target_tables = [table_name] if table_name else tables
    for tbl in target_tables:
        if tbl in tables:
            columns = inspector.get_columns(tbl)
            schema[tbl] = [
                {"name": col["name"], "type": str(col["type"])}
                for col in columns
            ]

    return schema


def execute_query(sql: str) -> dict:
    """Execute a SQL query and return results as a list of dicts."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            columns = list(result.keys())
            rows = [dict(zip(columns, row)) for row in result.fetchall()]

            # Convert non-serializable types
            for row in rows:
                for key, val in row.items():
                    if hasattr(val, 'isoformat'):
                        row[key] = val.isoformat()
                    elif isinstance(val, (bytes,)):
                        row[key] = val.decode('utf-8', errors='replace')

            return {"columns": columns, "rows": rows, "count": len(rows)}
    except Exception as e:
        return {"error": str(e), "columns": [], "rows": [], "count": 0}


def load_file_to_db(file_path: str, table_name: str, file_ext: str) -> dict:
    """Load a CSV, JSON, or Excel file into a SQLite table."""
    try:
        if file_ext == ".csv":
            df = pd.read_csv(file_path)
        elif file_ext in [".xls", ".xlsx"]:
            df = pd.read_excel(file_path)
        elif file_ext == ".json":
            df = pd.read_json(file_path)
        else:
            return {"error": "Unsupported file format."}

        # Smart Header Detection: Fix garbage/shifted headers from Mac Numbers or corrupted exports
        unnamed_count = sum(1 for c in df.columns if str(c).startswith("Unnamed"))
        is_garbage_first = str(df.columns[0]).startswith("bplist") or str(df.columns[0]).startswith("PK")
        
        if unnamed_count > len(df.columns) * 0.4 or is_garbage_first:
            for i in range(min(5, len(df))):
                row_vals = df.iloc[i].dropna()
                if len(row_vals) > len(df.columns) * 0.5:
                    df.columns = df.iloc[i]
                    df = df.iloc[i+1:].reset_index(drop=True)
                    break

        # Sanitize column names
        df.columns = [str(c).strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]
        df.to_sql(table_name, engine, if_exists="replace", index=False)

        inspector = inspect(engine)
        columns = inspector.get_columns(table_name)
        schema = [{"name": col["name"], "type": str(col["type"])} for col in columns]

        return {
            "table_name": table_name,
            "rows_loaded": len(df),
            "columns": schema,
            "preview": df.head(5).to_dict(orient="records"),
        }
    except Exception as e:
        return {"error": str(e)}


def delete_table(table_name: str) -> dict:
    """Drop a table from the sqlite database."""
    try:
        with engine.begin() as conn:
            conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
        return {"status": "success", "message": f"Table '{table_name}' deleted."}
    except Exception as e:
        return {"error": str(e)}
