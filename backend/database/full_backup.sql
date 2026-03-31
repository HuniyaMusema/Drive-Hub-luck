--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.rental_requests DROP CONSTRAINT IF EXISTS rental_requests_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rental_requests DROP CONSTRAINT IF EXISTS rental_requests_car_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_lottery_number_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lottery_settings DROP CONSTRAINT IF EXISTS lottery_settings_prize_car_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lottery_numbers DROP CONSTRAINT IF EXISTS lottery_numbers_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lottery_numbers DROP CONSTRAINT IF EXISTS lottery_numbers_lottery_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cars DROP CONSTRAINT IF EXISTS cars_seller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_performed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.app_settings DROP CONSTRAINT IF EXISTS app_settings_updated_by_fkey;
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS set_rental_requests_updated_at ON public.rental_requests;
DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
DROP TRIGGER IF EXISTS set_lottery_settings_updated_at ON public.lottery_settings;
DROP TRIGGER IF EXISTS set_lottery_numbers_updated_at ON public.lottery_numbers;
DROP TRIGGER IF EXISTS set_cars_updated_at ON public.cars;
DROP TRIGGER IF EXISTS set_app_settings_updated_at ON public.app_settings;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_rental_requests_user_id;
DROP INDEX IF EXISTS public.idx_rental_requests_status;
DROP INDEX IF EXISTS public.idx_rental_requests_car_id;
DROP INDEX IF EXISTS public.idx_payments_user_id;
DROP INDEX IF EXISTS public.idx_payments_status;
DROP INDEX IF EXISTS public.idx_payments_lottery_number_id;
DROP INDEX IF EXISTS public.idx_lottery_settings_status;
DROP INDEX IF EXISTS public.idx_lottery_numbers_user_id;
DROP INDEX IF EXISTS public.idx_lottery_numbers_status_expires;
DROP INDEX IF EXISTS public.idx_lottery_numbers_lottery_id;
DROP INDEX IF EXISTS public.idx_cars_type;
DROP INDEX IF EXISTS public.idx_cars_price;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.rental_requests DROP CONSTRAINT IF EXISTS rental_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.lottery_settings DROP CONSTRAINT IF EXISTS lottery_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.lottery_numbers DROP CONSTRAINT IF EXISTS lottery_numbers_pkey;
ALTER TABLE IF EXISTS ONLY public.lottery_numbers DROP CONSTRAINT IF EXISTS lottery_numbers_lottery_id_number_key;
ALTER TABLE IF EXISTS ONLY public.cars DROP CONSTRAINT IF EXISTS cars_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.app_settings DROP CONSTRAINT IF EXISTS app_settings_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.rental_requests;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.lottery_settings;
DROP TABLE IF EXISTS public.lottery_numbers;
DROP TABLE IF EXISTS public.cars;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.app_settings;
DROP FUNCTION IF EXISTS public.update_timestamp_columns();
DROP TYPE IF EXISTS public.user_status;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.user_mode;
DROP TYPE IF EXISTS public.rental_request_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_method;
DROP TYPE IF EXISTS public.lottery_status;
DROP TYPE IF EXISTS public.lottery_number_status;
DROP TYPE IF EXISTS public.car_type;
DROP TYPE IF EXISTS public.car_status;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: car_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.car_status AS ENUM (
    'available',
    'sold',
    'rented',
    'maintenance'
);


ALTER TYPE public.car_status OWNER TO postgres;

--
-- Name: car_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.car_type AS ENUM (
    'sale',
    'rental'
);


ALTER TYPE public.car_type OWNER TO postgres;

--
-- Name: lottery_number_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lottery_number_status AS ENUM (
    'available',
    'pending',
    'confirmed'
);


ALTER TYPE public.lottery_number_status OWNER TO postgres;

--
-- Name: lottery_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lottery_status AS ENUM (
    'active',
    'closed'
);


ALTER TYPE public.lottery_status OWNER TO postgres;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_method AS ENUM (
    'CBE',
    'Telebirr'
);


ALTER TYPE public.payment_method OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: rental_request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rental_request_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'completed'
);


ALTER TYPE public.rental_request_status OWNER TO postgres;

--
-- Name: user_mode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_mode AS ENUM (
    'car_mode',
    'lottery_mode'
);


ALTER TYPE public.user_mode OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status AS ENUM (
    'active',
    'suspended'
);


ALTER TYPE public.user_status OWNER TO postgres;

--
-- Name: update_timestamp_columns(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp_columns() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp_columns() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    config_key character varying(100) NOT NULL,
    config_value jsonb NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    action_type character varying(100) NOT NULL,
    performed_by uuid NOT NULL,
    target_id uuid,
    details jsonb,
    "timestamp" timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: cars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cars (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(12,2) NOT NULL,
    type public.car_type NOT NULL,
    description text,
    specs jsonb,
    location character varying(255),
    images jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    seller_id uuid,
    status public.car_status DEFAULT 'available'::public.car_status NOT NULL,
    contact_phone character varying(50)
);


ALTER TABLE public.cars OWNER TO postgres;

--
-- Name: lottery_numbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lottery_numbers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    number integer NOT NULL,
    status public.lottery_number_status DEFAULT 'available'::public.lottery_number_status NOT NULL,
    user_id uuid,
    lottery_id uuid NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lottery_numbers OWNER TO postgres;

--
-- Name: lottery_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lottery_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    start_number integer NOT NULL,
    end_number integer NOT NULL,
    prize_car_id uuid,
    prize_text character varying(255),
    status public.lottery_status DEFAULT 'active'::public.lottery_status NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT has_prize CHECK (((prize_car_id IS NOT NULL) OR (prize_text IS NOT NULL))),
    CONSTRAINT valid_number_range CHECK ((end_number >= start_number))
);


ALTER TABLE public.lottery_settings OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    lottery_number_id uuid NOT NULL,
    receipt_url character varying(512) NOT NULL,
    method public.payment_method NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: rental_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    car_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_price numeric(12,2) NOT NULL,
    status public.rental_request_status DEFAULT 'pending'::public.rental_request_status NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.rental_requests OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    mode public.user_mode DEFAULT 'car_mode'::public.user_mode,
    session_token character varying(512),
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    suspension_reason text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (config_key, config_value, updated_by, updated_at) FROM stdin;
Security	{"registrationEnabled": true}	\N	2026-03-30 15:12:55.059509+03
General	{"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "en"}	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 19:06:00.54842+03
Operational	{"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 19:07:19.902529+03
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, action_type, performed_by, target_id, details, "timestamp") FROM stdin;
1fd4ed2e-fb4e-4a02-afe2-0c48789c4239	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "General", "new_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "am"}}	2026-03-30 15:35:48.290078+03
f8bd3442-9845-46a0-a8b0-f7e75e82344a	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "General", "new_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "om"}, "old_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "am"}}	2026-03-30 15:36:37.342343+03
be2cd7c0-6fe9-463c-af55-613924568f23	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "General", "new_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "en"}, "old_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "om"}}	2026-03-30 15:36:53.990873+03
c05925db-d726-48c3-84c8-9794a5200652	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "General", "new_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "am"}, "old_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "en"}}	2026-03-30 15:37:02.237261+03
d7b0d44c-2caa-48c0-ad45-12ab0563eceb	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": true, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}}	2026-03-30 22:45:00.455106+03
476396c5-71a5-4296-9f3b-5400c2bdbcc6	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": true, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": true, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}}	2026-03-30 22:45:05.945782+03
8ceb481f-bf3e-4655-a0a4-ed10cf720863	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": true, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}}	2026-03-30 22:45:12.928294+03
fb51eb0a-f36d-4a2e-afda-e661dc5bd04c	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}}	2026-03-30 22:54:15.245256+03
7278b1c2-c63a-481b-acee-4f229532ac7d	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}}	2026-03-30 22:55:00.720848+03
91dd8a56-5335-4f4d-a383-e75818e2b354	LOTTERY_CREATED	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	{"end": 100, "start": 1}	2026-03-30 23:42:42.290204+03
e35a693c-3b40-4bb0-a0a6-62ac98aaf5fd	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}}	2026-03-30 23:53:51.516409+03
2246da5d-51a2-49a5-9c25-8cded6f3c852	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}}	2026-03-30 23:53:53.516757+03
719ecd67-3483-49ab-b9eb-fbee2a8f1943	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}}	2026-03-30 23:53:59.182361+03
6d90a85a-26f6-4a82-b7db-cfc20663ebc8	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	022a46f7-faff-4190-8b12-e18dd34a6950	{"status": "approved", "lottery_number_id": "c17762bf-86f8-47dd-8a93-e3d8aab8a8e8"}	2026-03-31 16:45:23.838879+03
d969c8b2-bcc1-4550-aebf-830288dff68b	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	49524c77-9876-4568-8d44-dd83de01d40d	{"status": "approved", "lottery_number_id": "28bb2e32-88ba-492f-abef-a7a9d0d7347d"}	2026-03-31 16:50:24.342388+03
e7330749-3993-4ec5-9256-4ca2203d41cc	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	9f9ff197-72a5-4668-923a-3a2b31a05626	{"status": "approved", "lottery_number_id": "07c72e43-8ce1-4b89-82ce-f0d768b546b0"}	2026-03-31 16:58:25.961119+03
2d72d625-6887-4e8f-a3ba-6c62dfa280e8	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	7f1c7e6f-ec34-4fa8-b687-9d36a44d59fe	{"status": "approved", "lottery_number_id": "a0c10d87-adf4-4670-b280-27b21601a4c9"}	2026-03-31 17:30:50.995471+03
6e4cc9b8-3e48-4e37-b77d-2d11b9684d45	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	8edf3bbd-1b32-44c1-8d5d-e1e3316bf99f	{"status": "approved", "lottery_number_id": "6a5be849-d54c-4666-8a02-fd152a3cb2a0"}	2026-03-31 17:35:11.222684+03
7a3e696e-bbdc-4ae1-bbc7-00587bb0f19c	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	3a4d4763-6226-4e55-b3a8-f157743f78ed	{"status": "approved", "lottery_number_id": "05e43771-5567-4413-8da9-a5588739b326"}	2026-03-31 17:51:42.325353+03
9b1c53e5-be34-46c8-a20d-8f67ff2e0278	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	5bfd49d7-2c7a-4b32-bf14-b4e493d0d07f	{"status": "approved", "lottery_number_id": "4a07a418-fa04-4973-8c19-b8c5324dfa5f"}	2026-03-31 18:02:34.267355+03
9d0ffb92-90fe-480b-8acf-a6fe9e41e20f	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	4b0d9976-f2b7-4f09-bf69-6062ff9028b1	{"status": "approved", "lottery_number_id": "25ede8a6-429b-4abc-98e8-31d3aec11c36"}	2026-03-31 18:18:03.610725+03
96ee04c0-7d91-4e8e-ac9e-8b408a9969b7	PAYMENT_VERIFIED	40f94b32-ba91-41b0-b3b2-e30d799cc341	14a79cda-e4cc-429f-b162-449acef57d27	{"status": "approved", "lottery_number_id": "1755c4c9-2ea7-4721-b3a8-a5538f839964"}	2026-03-31 18:59:54.251315+03
25a4696e-26c8-4168-b680-63590673cf8b	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "General", "new_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "en"}, "old_value": {"timezone": "Africa/Addis_Ababa", "dateFormat": "DD/MM/YYYY", "platformName": "Gech (ጌች)", "defaultCurrency": "ETB", "defaultLanguage": "am"}}	2026-03-31 19:06:00.610151+03
5a42a0aa-3b3b-472b-81fa-aa46a2775e0f	UPDATE_SETTING	40f94b32-ba91-41b0-b3b2-e30d799cc341	\N	{"key": "Operational", "new_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": false, "rentalsModuleEnabled": true}, "old_value": {"platformEnabled": true, "maintenanceMessage": "", "salesModuleEnabled": false, "lotteryModuleEnabled": true, "rentalsModuleEnabled": true}}	2026-03-31 19:07:19.918508+03
\.


--
-- Data for Name: cars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cars (id, name, price, type, description, specs, location, images, created_at, updated_at, seller_id, status, contact_phone) FROM stdin;
966efdfa-8647-4b03-9dd6-030713149ded	Toyota Hilux	3500000.00	sale		{"fuel": "Gasoline", "year": 2023, "seats": 5, "mileage": "10000km", "transmission": "Manual"}	Addis Ababa	["/uploads/1774872451393-car1.webp"]	2026-03-30 15:07:31.421182+03	2026-03-30 15:07:31.421182+03	40f94b32-ba91-41b0-b3b2-e30d799cc341	available	\N
c677ade9-d3f9-4943-b18e-c468b735813e	BYD Seagull	72000.00	rental		{"fuel": "Electric", "year": 2019, "seats": 4, "mileage": "8000Km", "transmission": "Automatic"}	Addis Ababa	["/uploads/1774872527185-bydseagul.webp"]	2026-03-30 15:08:47.209902+03	2026-03-30 15:08:47.209902+03	40f94b32-ba91-41b0-b3b2-e30d799cc341	available	\N
\.


--
-- Data for Name: lottery_numbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lottery_numbers (id, number, status, user_id, lottery_id, expires_at, created_at, updated_at) FROM stdin;
ef4eed40-55e8-43b1-b9dc-9f362a3fe45e	1	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
8ee829f9-8d43-43b6-b7a6-b7714d379b13	2	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
a93607a3-25d8-4715-9cd7-c31b869b1cc4	3	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
9a993b5c-3134-4d74-878b-e00b08136679	4	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
3f2fa072-39e3-4a68-9f40-b9e2fa39db79	10	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
8b326a28-cd2e-43d4-af4a-a98c32aa8606	11	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
bb5901b0-6a46-41fe-aedd-a9424c4b8591	12	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
73393bb7-2a41-45be-91be-05ae41011a31	13	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
199e01f7-06fb-484d-89a7-eef94137c13f	14	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
5e664255-ea70-40c9-bd65-d2f987a7c518	15	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
dcc8f53c-5852-40c8-bc2d-a85ed255c739	19	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
ef40d3b6-e984-4991-9157-dc470aebc2b1	20	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
9c1564ff-88e4-4943-828d-f77cb45d51a1	21	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
9c7d9e56-ac86-4f2a-990d-ed9ffa711759	23	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
d63072b0-2033-43a5-8778-d219ccc35e1a	24	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
9ada94f2-3fb4-4b60-aa88-b1cea62cb56d	26	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
ceb7ebfe-a714-4bfd-a20b-92eade129d0b	27	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
238e12bb-50b8-47d7-90c9-8e601543ab87	28	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
fa2cc606-9255-4841-ac15-eed3c509e8f5	29	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
a46b47b9-7cc9-4300-b8a6-c35d0af2cc73	30	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
2549cc92-ac84-45fa-8753-fe272c7736b9	31	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
c022994b-215e-4f37-867b-3dfc1cbd362d	32	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
5dce128e-d7ae-4d79-b882-bca935fe28d6	33	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
ec8dac4e-1821-41e2-a3a9-a4cacf89b972	34	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
f82aadad-3505-40c6-8fd1-b0804dbca486	35	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
4e468dbb-c093-4ecb-adb8-d40f6240f2a6	36	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
1870d80b-fe26-484d-b7a0-cf4bae2e6c33	37	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
630d5cbe-a69b-42c7-ae7c-a2d6ff629618	38	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
bf236410-d0eb-4670-b011-54df21f92877	39	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
217ea71a-3152-42de-b872-dda8af273c6e	40	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
07d31529-8394-4970-bb6c-c1677f3d05f7	41	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
33b53d5f-6217-4551-a8e1-8bf74f7ecb22	42	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
3b026d55-1087-45b3-bddf-42a35fd752f4	43	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
e33ed5a1-23cc-4182-9ad6-74a6e9a47bb7	44	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
253351f8-9d32-4720-a74e-4c66289ff8d2	46	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
fe773b8a-30bc-4e98-8ead-faf9c5a97188	47	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
81b7a790-ac49-43ae-9c5c-4384a14d84f3	48	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
67bf3737-686c-4a5c-bdbf-b4692bf8a4b1	50	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
3c30920a-2e3e-4f48-a827-9e76f6ffd935	51	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
33788f67-6450-4ae7-b5fa-b6fe03fc82ff	52	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
7f0ee629-1397-4531-a38e-f64da9d72cc8	53	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
0b2e05e1-fb73-4fb1-ad9e-8171440ef79e	54	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
056d6733-b156-49be-a772-02b0876089da	55	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
767295aa-d004-4a0e-aa56-4b3eb313f242	56	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
652449d2-845a-4144-8d8d-49d8686ae1ac	57	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
78be9a7a-edd7-4754-8f1b-60d10688e856	58	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
4423522c-20d2-4db1-bd71-396ec4a1a39f	59	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
176b4033-04c1-4f3d-8d54-16d436c58aba	61	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
5f834cd7-d8c2-4d9e-aa6d-9ea2925e987e	62	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
dc2aed4b-4022-419b-904c-3a6bffa23735	63	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
2d7dbbd8-f770-4753-8c6a-4f6d5d451400	64	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
1a1bf6a3-9520-496c-965d-b9a26d071e41	65	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
8bc121bc-6cb7-49bd-91db-c35879903f40	66	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
752528c3-e5b5-4911-88ab-2602078b136f	67	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
45d6a377-59cb-4307-9976-11674f31bf83	68	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
22fa7ac5-cd44-440c-8958-00e136d8fdea	70	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
38dca1e3-d377-4995-8887-f033a294323f	71	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
80d08fb2-3e17-45fa-a0db-6541960d1746	72	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
8a6471d9-f2f1-409b-bcb3-31471a509560	73	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
0d36d29a-819e-4bea-a4b4-27f165049dcc	74	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
2c0a954d-9996-4345-91e1-1e26eb18091c	75	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
d5a45905-260a-4081-837e-58dc52e9857f	76	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
280b60f5-a034-4fac-a04e-1afd46fc22e9	77	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
090c2e63-2179-4048-bec2-1501274108a7	78	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
308a95fb-319c-4847-a3a6-6e4ffe35f5e6	79	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
f0de5997-afca-45d9-ae8e-8afd7120647a	80	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
9564b2f8-444d-4277-807e-8cd6c0155a3f	81	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
b477af2b-24d4-435c-91bd-e731d7e6a774	82	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
4d66148f-6814-4d59-8b64-da8b63c11eb0	83	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
3027d9ee-6ffb-4c8d-a468-24c7acc91e35	84	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
046cce35-1d2c-4bec-a722-51dd6b885794	85	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
a5ba34ec-42d6-4ecc-b3f7-8cf5be768535	86	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
bd285edf-40f3-4ee4-98a9-3b473afc2683	87	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
d1c7146a-6332-4a68-9f46-6e923f2035f5	88	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
ec3f26b2-13b1-4f6b-b36a-23c16b9ecc20	89	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
beece0ba-38c1-44ac-a0a9-44f9d5ba3da7	90	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
7a8f05ca-60fc-4ec5-9153-745108638eff	91	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
9b021a99-5ea1-46a8-944b-6eb82ed9d53e	92	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
727ff7ec-58ae-4927-9301-697f4af50ec5	93	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
c4e78fcc-2388-4b68-a726-517f905ec63c	94	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
5cf96281-43f0-42fa-b4e6-129f79a7edc4	95	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
26b02623-5531-448a-97c0-ec7c6ecfb5da	96	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
e66138f3-98c9-41f7-be68-e146d85e2ba9	97	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
e0b4d3bf-409d-4e06-81cf-8115d541cca0	6	pending	41154b00-42a8-4a6e-9235-7f548fc16af0	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 15:27:29.983532+03
7b7b29c5-5d97-4a51-bc12-976ad3368ca9	25	pending	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 16:40:47.26756+03
28bb2e32-88ba-492f-abef-a7a9d0d7347d	9	confirmed	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 16:50:24.342388+03
07c72e43-8ce1-4b89-82ce-f0d768b546b0	7	confirmed	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 16:58:25.961119+03
a0c10d87-adf4-4670-b280-27b21601a4c9	49	confirmed	41154b00-42a8-4a6e-9235-7f548fc16af0	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 17:30:50.995471+03
a3c8de13-aa06-4167-a7fc-259ab895aacc	69	pending	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 17:31:32.574312+03
05e43771-5567-4413-8da9-a5588739b326	60	confirmed	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 17:51:42.325353+03
4a07a418-fa04-4973-8c19-b8c5324dfa5f	17	confirmed	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 18:02:34.267355+03
25ede8a6-429b-4abc-98e8-31d3aec11c36	45	confirmed	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 18:18:03.610725+03
1755c4c9-2ea7-4721-b3a8-a5538f839964	8	confirmed	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 18:59:54.251315+03
bebaf49a-9bf0-43ff-8313-73dedbb962c6	98	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
1efbd836-7e96-4741-81ca-47e3df4eed3f	99	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
acf4a117-c1fd-4b18-a82c-0af772fc2e9f	100	available	\N	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
7c5afb17-1913-43ba-b8b3-fcee6200e3b8	5	pending	41154b00-42a8-4a6e-9235-7f548fc16af0	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 15:09:59.70967+03
f3e6d011-bbdf-4ebe-a247-e62c5434ec30	18	pending	41154b00-42a8-4a6e-9235-7f548fc16af0	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 16:15:01.416681+03
c17762bf-86f8-47dd-8a93-e3d8aab8a8e8	16	confirmed	40f94b32-ba91-41b0-b3b2-e30d799cc341	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 16:45:23.838879+03
6a5be849-d54c-4666-8a02-fd152a3cb2a0	22	confirmed	41154b00-42a8-4a6e-9235-7f548fc16af0	1ebeb9cc-6464-463c-be03-e330644d2f06	\N	2026-03-30 23:42:42.290204+03	2026-03-31 17:35:11.222684+03
\.


--
-- Data for Name: lottery_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lottery_settings (id, start_number, end_number, prize_car_id, prize_text, status, created_at, updated_at) FROM stdin;
1ebeb9cc-6464-463c-be03-e330644d2f06	1	100	\N	Toyota 	active	2026-03-30 23:42:42.290204+03	2026-03-30 23:42:42.290204+03
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, user_id, lottery_number_id, receipt_url, method, status, reviewed_by, reviewed_at, created_at, updated_at) FROM stdin;
022a46f7-faff-4190-8b12-e18dd34a6950	40f94b32-ba91-41b0-b3b2-e30d799cc341	c17762bf-86f8-47dd-8a93-e3d8aab8a8e8	/uploads/receipt-1774964656635-reciept.jpg	CBE	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 16:45:23.838879+03	2026-03-31 16:44:16.672481+03	2026-03-31 16:45:23.838879+03
49524c77-9876-4568-8d44-dd83de01d40d	40f94b32-ba91-41b0-b3b2-e30d799cc341	28bb2e32-88ba-492f-abef-a7a9d0d7347d	/uploads/receipt-1774965008754-reciept.jpg	CBE	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 16:50:24.342388+03	2026-03-31 16:50:08.829421+03	2026-03-31 16:50:24.342388+03
9f9ff197-72a5-4668-923a-3a2b31a05626	40f94b32-ba91-41b0-b3b2-e30d799cc341	07c72e43-8ce1-4b89-82ce-f0d768b546b0	/uploads/receipt-1774965480793-reciept.jpg	CBE	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 16:58:25.961119+03	2026-03-31 16:58:00.830875+03	2026-03-31 16:58:25.961119+03
7f1c7e6f-ec34-4fa8-b687-9d36a44d59fe	41154b00-42a8-4a6e-9235-7f548fc16af0	a0c10d87-adf4-4670-b280-27b21601a4c9	/uploads/receipt-1774967382462-reciept.jpg	CBE	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 17:30:50.995471+03	2026-03-31 17:29:42.486516+03	2026-03-31 17:30:50.995471+03
8edf3bbd-1b32-44c1-8d5d-e1e3316bf99f	41154b00-42a8-4a6e-9235-7f548fc16af0	6a5be849-d54c-4666-8a02-fd152a3cb2a0	/uploads/receipt-1774967668061-reciept.jpg	CBE	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 17:35:11.222684+03	2026-03-31 17:34:28.102413+03	2026-03-31 17:35:11.222684+03
3a4d4763-6226-4e55-b3a8-f157743f78ed	40f94b32-ba91-41b0-b3b2-e30d799cc341	05e43771-5567-4413-8da9-a5588739b326	/uploads/receipt-1774968691708-reciept.jpg	CBE	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 17:51:42.325353+03	2026-03-31 17:51:31.797026+03	2026-03-31 17:51:42.325353+03
5bfd49d7-2c7a-4b32-bf14-b4e493d0d07f	40f94b32-ba91-41b0-b3b2-e30d799cc341	4a07a418-fa04-4973-8c19-b8c5324dfa5f	/uploads/receipt-1774969344214-reciept.jpg	Telebirr	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 18:02:34.267355+03	2026-03-31 18:02:24.240694+03	2026-03-31 18:02:34.267355+03
4b0d9976-f2b7-4f09-bf69-6062ff9028b1	40f94b32-ba91-41b0-b3b2-e30d799cc341	25ede8a6-429b-4abc-98e8-31d3aec11c36	/uploads/receipt-1774970277552-reciept.jpg	Telebirr	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 18:18:03.610725+03	2026-03-31 18:17:57.580359+03	2026-03-31 18:18:03.610725+03
14a79cda-e4cc-429f-b162-449acef57d27	40f94b32-ba91-41b0-b3b2-e30d799cc341	1755c4c9-2ea7-4721-b3a8-a5538f839964	/uploads/receipt-1774972721519-reciept.jpg	CBE	approved	40f94b32-ba91-41b0-b3b2-e30d799cc341	2026-03-31 18:59:54.251315+03	2026-03-31 18:58:41.585027+03	2026-03-31 18:59:54.251315+03
\.


--
-- Data for Name: rental_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rental_requests (id, user_id, car_id, start_date, end_date, total_price, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, created_at, updated_at, mode, session_token, status, suspension_reason) FROM stdin;
41154b00-42a8-4a6e-9235-7f548fc16af0	Bit Anya	gofipa8871@fun4k.com	$2b$10$v3BleUdu23nWlmk2QUAGseyQ/9OQViHorNy9dGe/40MEgD9hLfORS	user	2026-03-30 15:17:05.177185+03	2026-03-31 17:33:34.996597+03	car_mode	2e8d2843-3cac-4885-8039-cd82582e3a3b	active	\N
40f94b32-ba91-41b0-b3b2-e30d799cc341	Platform Admin	admin@drivehub.com	$2b$10$LV1kA.8OkWxvF9W4sOvEaOhcIq9wrOOyDGwWbsrOAvF8/EM.2uZV.	admin	2026-03-30 14:52:21.243789+03	2026-03-31 18:59:32.097757+03	car_mode	e74fd783-a1f2-450b-9173-34fdb394d255	active	\N
\.


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (config_key);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cars cars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_pkey PRIMARY KEY (id);


--
-- Name: lottery_numbers lottery_numbers_lottery_id_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lottery_numbers
    ADD CONSTRAINT lottery_numbers_lottery_id_number_key UNIQUE (lottery_id, number);


--
-- Name: lottery_numbers lottery_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lottery_numbers
    ADD CONSTRAINT lottery_numbers_pkey PRIMARY KEY (id);


--
-- Name: lottery_settings lottery_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lottery_settings
    ADD CONSTRAINT lottery_settings_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: rental_requests rental_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_cars_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cars_price ON public.cars USING btree (price);


--
-- Name: idx_cars_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cars_type ON public.cars USING btree (type);


--
-- Name: idx_lottery_numbers_lottery_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lottery_numbers_lottery_id ON public.lottery_numbers USING btree (lottery_id);


--
-- Name: idx_lottery_numbers_status_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lottery_numbers_status_expires ON public.lottery_numbers USING btree (status, expires_at) WHERE (status = 'pending'::public.lottery_number_status);


--
-- Name: idx_lottery_numbers_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lottery_numbers_user_id ON public.lottery_numbers USING btree (user_id);


--
-- Name: idx_lottery_settings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lottery_settings_status ON public.lottery_settings USING btree (status);


--
-- Name: idx_payments_lottery_number_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_lottery_number_id ON public.payments USING btree (lottery_number_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_rental_requests_car_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_requests_car_id ON public.rental_requests USING btree (car_id);


--
-- Name: idx_rental_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_requests_status ON public.rental_requests USING btree (status);


--
-- Name: idx_rental_requests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_requests_user_id ON public.rental_requests USING btree (user_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: app_settings set_app_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_columns();


--
-- Name: cars set_cars_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_cars_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_columns();


--
-- Name: lottery_numbers set_lottery_numbers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_lottery_numbers_updated_at BEFORE UPDATE ON public.lottery_numbers FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_columns();


--
-- Name: lottery_settings set_lottery_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_lottery_settings_updated_at BEFORE UPDATE ON public.lottery_settings FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_columns();


--
-- Name: payments set_payments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_columns();


--
-- Name: rental_requests set_rental_requests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_rental_requests_updated_at BEFORE UPDATE ON public.rental_requests FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_columns();


--
-- Name: users set_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_columns();


--
-- Name: app_settings app_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cars cars_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT cars_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lottery_numbers lottery_numbers_lottery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lottery_numbers
    ADD CONSTRAINT lottery_numbers_lottery_id_fkey FOREIGN KEY (lottery_id) REFERENCES public.lottery_settings(id) ON DELETE CASCADE;


--
-- Name: lottery_numbers lottery_numbers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lottery_numbers
    ADD CONSTRAINT lottery_numbers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: lottery_settings lottery_settings_prize_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lottery_settings
    ADD CONSTRAINT lottery_settings_prize_car_id_fkey FOREIGN KEY (prize_car_id) REFERENCES public.cars(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_lottery_number_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_lottery_number_id_fkey FOREIGN KEY (lottery_number_id) REFERENCES public.lottery_numbers(id) ON DELETE CASCADE;


--
-- Name: payments payments_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rental_requests rental_requests_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- Name: rental_requests rental_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_requests
    ADD CONSTRAINT rental_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

