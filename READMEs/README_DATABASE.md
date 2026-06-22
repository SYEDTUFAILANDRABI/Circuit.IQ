# 💾 Circuit.IQ — Database Schemas & Persistence Subsystem

Circuit.IQ features a unified database layer that persists student profiles, saved breadboard configurations, and experiment metrics.

---

## 🔄 Dual Database Adaptability & State Routing

The Python Flask backend includes a dual-database client adapter ([database.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/database.py)) that handles local dev environments and cloud deployments:

```
                          ┌───────────────────────────┐
                          │    REST /api Database     │
                          │        Transaction        │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │    database.py Adapter    │
                          └─────────────┬─────────────┘
                                        │
                        Are SUPABASE Env Keys Present?
                                 /          \
                               Yes           No
                               /              \
                              ▼                ▼
                     [Supabase PostgreSQL]   [Local SQLite File]
                     Cloud database server   circuit_iq.db in root
```

1.  **Local SQLite Development (Default)**:
    *   Triggered when no Supabase keys are defined in `.env`.
    *   Initializes a local database file `circuit_iq.db` in the project root directory.
    *   Seeds default profiles and a pre-wired series circuit.
2.  **Supabase cloud Database (Production)**:
    *   Triggered when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are defined in `.env`.
    *   Reads and writes to Supabase PostgreSQL cloud tables.

---

## 📂 Database Files & Schema Scripts

All schema setup and migration files are located in the [LABdata-IQ/](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABdata-IQ) folder:

*   **[schema.sql](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABdata-IQ/schema.sql)**
    *   Creates base tables (`profiles`, `circuits`, `experiment_logs`).
    *   Sets up triggers, constraints, Row Level Security (RLS) policies, and handles test data seeding.
*   **[customise.sql](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABdata-IQ/customise.sql)**
    *   Applies schema migrations, such as adding analytics properties (view counts, soft deletion flags, and assessment scores).

---

## 📊 Database Tables & Column Registry

The database structure consists of three tables:

### 1. `profiles` Table
Stores student metadata and portal credentials:

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / TEXT | Primary Key | Linked profile auth reference. |
| `full_name` | TEXT | Not Null | Student's full name. |
| `university` | TEXT | - | Associated university name. |
| `semester` | TEXT | - | Current college semester. |
| `graduation_year` | INTEGER | - | Expected graduation year. |
| `role` | TEXT | Default: `'student'` | Privileges (`student` or `professor`). |
| `phone` | TEXT | - | Student contact number. |
| `is_active` | BOOLEAN | Default: `True` | Tracks account status. |
| `created_at` | TIMESTAMPTZ | - | Creation audit timestamp. |
| `updated_at` | TIMESTAMPTZ | - | Modification audit timestamp. |

### 2. `circuits` Table
Saves breadboard component layouts and wire links:

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / TEXT | Primary Key | Unique circuit identifier. |
| `user_id` | UUID / TEXT | Foreign Key (profiles) | Owner identification link. |
| `name` | TEXT | Not Null | Format: `Experiment: <experiment_type>`. |
| `description` | TEXT | - | Circuit description. |
| `circuit_data` | JSONB / TEXT | Not Null | JSON payload of components and wires. |
| `is_public` | BOOLEAN | Default: `False` | Visibility toggle. |
| `tags` | JSONB / TEXT | Default: `'[]'` | Search tags. |
| `status` | TEXT | Default: `'draft'` | Progress state (`draft` or `completed`). |
| `view_count` | INTEGER | Default: `0` | Analytics view counter. |
| `is_deleted` | BOOLEAN | Default: `False` | Soft-deletion flag. |

#### 📝 `circuit_data` JSON Structure
```json
{
  "placedComponents": [
    { "type": "resistor", "id": "comp_1", "snap1": 12, "snap2": 15 }
  ],
  "wires": [
    { "fromHole": 15, "toHole": 22 }
  ],
  "params": {
    "V": 12,
    "R": 100,
    "L": 50,
    "C": 100,
    "f": 50,
    "T": 25
  }
}
```

### 3. `experiment_logs` Table
Tracks progress, grades, and AI tutor logs:

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / TEXT | Primary Key | Unique log identifier. |
| `user_id` | UUID / TEXT | Foreign Key (profiles) | Associated student link. |
| `circuit_id` | UUID / TEXT | Foreign Key (circuits) | Source layout layout link. |
| `experiment_type` | TEXT | Not Null | Active experiment key (e.g. `ohms`). |
| `results` | JSONB / TEXT | - | Measured current/volt telemetry array. |
| `duration_seconds`| INTEGER | - | Total seconds spent in workspace. |
| `score` | NUMERIC | - | Calculated score (0 - 100). |
| `notes` | TEXT | - | Student notes. |
| `status` | TEXT | Default: `'completed'` | Log completion state. |
| `attempt_number` | INTEGER | Default: `1` | Total attempts counter. |
| `feedback` | TEXT | - | AI tutor grade evaluation. |

---

## 🔒 Row Level Security (RLS) Policies

To enforce data privacy on Supabase PostgreSQL cloud tables, Row Level Security is enabled:
*   **Select Policy**: Users can only retrieve records matching their login UUID (`auth.uid() = user_id`).
*   **Insert/Update/Delete Policies**: Restricts write access so users can only modify their own data.
