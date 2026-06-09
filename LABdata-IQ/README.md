# 💾 Circuit.IQ — Database Schemas & Migrations

> Directory containing database initialization and customization scripts for both local development (SQLite) and production hosting (Supabase PostgreSQL).

---

## 📁 File Structure

*   [schema.sql](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABdata-IQ/schema.sql) – Core database tables (`profiles`, `circuits`, `experiment_logs`), update triggers, Row Level Security (RLS) policies, and test database seeding.
*   [customise.sql](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABdata-IQ/customise.sql) – Database customization script containing alter table statements to add additional metrics (view counts, scoring parameters, and deletion flags).

---

## 🔄 Dual Database Adaptability (SQLite & Supabase)

The Python Flask backend integrates a hybrid database client wrapper ([database.py](file:///c:/Users/anaya/OneDrive/Desktop/working%20folder%20new/Circuit.IQ/LABback-IQ/database.py)) that manages data persistence:
1.  **SQLite (Local Development)**: 
    *   Triggered automatically if no Supabase environment keys are defined in the `.env` file.
    *   Initializes a local `circuit_iq.db` file in the project root directory.
    *   Uses Python's built-in `sqlite3` driver.
    *   Creates tables and seeds test profile records automatically on boot.
2.  **Supabase PostgreSQL (Production Hosting)**:
    *   Triggered if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are defined in the `.env` file.
    *   Writes/loads to cloud tables directly using the `supabase` SDK client.

---

## 📊 Database Schema Details

### 1. `profiles` Table
Stores student user account metadata and role descriptions.
*   `id` (UUID / TEXT, Primary Key): Links to user authentication credentials.
*   `full_name` (TEXT): Student's full name.
*   `university` (TEXT): Associated academic institution.
*   `semester` (TEXT): Active college semester.
*   `graduation_year` (INTEGER): Expected graduation year.
*   `role` (TEXT, Default: `'student'`): Account privileges (`student` or `professor`).
*   `phone` (TEXT): Student contact number.
*   `is_active` (BOOLEAN, Default: `True`): Tracks account suspension/activation status.
*   `created_at` / `updated_at`: Audit timestamps.

### 2. `circuits` Table
Persists component placements and coordinate configurations.
*   `id` (UUID / TEXT, Primary Key): Unique circuit identifier.
*   `user_id` (UUID / TEXT, Foreign Key): Links to owner in `profiles`.
*   `name` (TEXT): Format is `Experiment: <experiment_type>` (e.g., `Experiment: ohms`).
*   `description` (TEXT): Description of the circuit.
*   `circuit_data` (JSONB / JSON String): Map containing placed electronic components (types, snap positions) and connected wires array.
*   `is_public` (BOOLEAN, Default: `False`): Tracks public sharing parameters.
*   `tags` (JSONB / TEXT, Default: `'[]'`): User tags.
*   `status` (TEXT, Default: `'draft'`): Tracks circuit draft/finalized state.
*   `view_count` (INTEGER, Default: `0`): View count tracking.
*   `is_deleted` (BOOLEAN, Default: `False`): Soft deletion flag.

### 3. `experiment_logs` Table
Logs student simulator history and viva grades.
*   `id` (UUID / TEXT, Primary Key): Unique log reference.
*   `user_id` (UUID / TEXT, Foreign Key): Links to student in `profiles`.
*   `circuit_id` (UUID / TEXT, Foreign Key): Links to saved circuit configuration.
*   `experiment_type` (TEXT): Active experiment type key (e.g. `ohms`, `lcr`, `rc`).
*   `results` (JSONB / TEXT): Simulation parameter values, observations, and telemetry logs.
*   `duration_seconds` (INTEGER): Time spent in simulator workspace.
*   `score` (NUMERIC): Graded percentage of completed steps and viva answers.
*   `notes` (TEXT): Student comments.
*   `status` (TEXT, Default: `'completed'`): Log status.
*   `attempt_number` (INTEGER, Default: `1`): Tracks attempts count.
*   `feedback` (TEXT): System-generated academic evaluation.

---

## 🔒 Security Policies (RLS)

PostgreSQL Row Level Security (RLS) is enabled on Supabase database tables to enforce strict user data separation:
*   **Select Policy**: Users can only read circuits, logs, and profiles where the `user_id` matches their authenticated UID (`auth.uid() = user_id`).
*   **Insert/Update/Delete Policies**: Users can only write or modify records belonging to their own user IDs.

---

## 🌱 Seeding Sandbox Data

On initialization, the local SQLite database seeds standard records to allow immediate dev workspace access:
*   **Default Profile**: Aisha Rahman (NUST, Fall 2025, ID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
*   **Default Circuit**: A pre-wired series Ohm's Law circuit consisting of a DC power supply and a 470Ω resistor linked together, saved under `Experiment: ohms`.
