--
-- PostgreSQL database dump
--

\restrict irn5SfbdqfyxIPYdf4DnxsAotpkpZvXcToAdK5KhDiKeQZfwUWdNRrWoV5S36Xf

-- Dumped from database version 18.3 (Postgres.app)
-- Dumped by pg_dump version 18.3 (Postgres.app)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BeneficiaryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BeneficiaryType" AS ENUM (
    'INTERNAL',
    'EXTERNAL'
);


ALTER TYPE public."BeneficiaryType" OWNER TO postgres;

--
-- Name: DisbursementMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DisbursementMethod" AS ENUM (
    'CASH',
    'CHEQUE',
    'BANK_TRANSFER'
);


ALTER TYPE public."DisbursementMethod" OWNER TO postgres;

--
-- Name: DonorType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DonorType" AS ENUM (
    'INTERNAL',
    'EXTERNAL'
);


ALTER TYPE public."DonorType" OWNER TO postgres;

--
-- Name: FinancialStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialStatus" AS ENUM (
    'PENDING',
    'APPROVED'
);


ALTER TYPE public."FinancialStatus" OWNER TO postgres;

--
-- Name: FundRequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FundRequestStatus" AS ENUM (
    'RECEIVED',
    'UNDER_VERIFICATION',
    'UNDER_DISCUSSION',
    'UNDER_INVESTIGATION',
    'INQUIRY_SCHEDULED',
    'APPROVED',
    'REJECTED',
    'ON_HOLD',
    'ON_GOING',
    'DISBURSED'
);


ALTER TYPE public."FundRequestStatus" OWNER TO postgres;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'UNPAID',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- Name: LivingType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LivingType" AS ENUM (
    'OWN_HOUSE',
    'RENTED',
    'MONTHLY_SUBSCRIPTION_MAIN',
    'MONTHLY_SUBSCRIPTION_SUB'
);


ALTER TYPE public."LivingType" OWNER TO postgres;

--
-- Name: PaymentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentType" AS ENUM (
    'ONE_TIME',
    'MONTHLY'
);


ALTER TYPE public."PaymentType" OWNER TO postgres;

--
-- Name: PlanType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlanType" AS ENUM (
    'MONTHLY',
    'ANNUALLY',
    'LIFETIME'
);


ALTER TYPE public."PlanType" OWNER TO postgres;

--
-- Name: RegistrationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RegistrationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."RegistrationStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'PLATFORM_ADMIN',
    'MAIN_ADMIN',
    'SUB_ADMIN',
    'MEMBER',
    'COMMITTEE_ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."Status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Committee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Committee" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    logo text,
    "shortCode" text,
    "establishedDate" timestamp(3) without time zone,
    "registrationNo" text,
    address text,
    email text,
    "contactNo" text,
    website text,
    "bankName" text,
    "accountNumber" text,
    "accountHolderName" text,
    branch text,
    "defaultCurrency" text DEFAULT 'LKR'::text,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "mainMahallaId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "subMahallaId" text,
    "allowMainMahallaView" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Committee" OWNER TO postgres;

--
-- Name: CommitteeMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommitteeMember" (
    id text NOT NULL,
    role text NOT NULL,
    "committeeTermId" text NOT NULL,
    "familyMemberId" text NOT NULL,
    "hasDashboardAccess" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "activeDateFrom" timestamp(3) without time zone,
    "activeDateTo" timestamp(3) without time zone,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL
);


ALTER TABLE public."CommitteeMember" OWNER TO postgres;

--
-- Name: CommitteeTerm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommitteeTerm" (
    id text NOT NULL,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "committeeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "financialsApprovedAt" timestamp(3) without time zone,
    "financialsStatus" public."FinancialStatus" DEFAULT 'PENDING'::public."FinancialStatus" NOT NULL
);


ALTER TABLE public."CommitteeTerm" OWNER TO postgres;

--
-- Name: CommitteeTermBalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommitteeTermBalance" (
    id text NOT NULL,
    amount double precision DEFAULT 0 NOT NULL,
    "committeeTermId" text NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CommitteeTermBalance" OWNER TO postgres;

--
-- Name: Donation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Donation" (
    id text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentMethod" text NOT NULL,
    reference text,
    "donorId" text NOT NULL,
    "committeeId" text NOT NULL,
    "committeeTermId" text NOT NULL,
    "mainMahallaId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "attachmentUrl" text
);


ALTER TABLE public."Donation" OWNER TO postgres;

--
-- Name: Donor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Donor" (
    id text NOT NULL,
    type public."DonorType" DEFAULT 'INTERNAL'::public."DonorType" NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    "familyMemberId" text,
    "mainMahallaId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "subMahallaId" text
);


ALTER TABLE public."Donor" OWNER TO postgres;

--
-- Name: DonorContact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DonorContact" (
    id text NOT NULL,
    name text NOT NULL,
    phone text,
    whatsapp text,
    email text,
    "donorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DonorContact" OWNER TO postgres;

--
-- Name: FamilyCard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FamilyCard" (
    id text NOT NULL,
    "mainMahallaCardNo" text,
    "subMahallaCardNo" text,
    "registeredDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "livingType" public."LivingType" NOT NULL,
    "livingFromDate" timestamp(3) without time zone,
    attachments text[],
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "subMahallaId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public."FamilyCard" OWNER TO postgres;

--
-- Name: FamilyMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FamilyMember" (
    id text NOT NULL,
    title text NOT NULL,
    "fullName" text NOT NULL,
    dob timestamp(3) without time zone NOT NULL,
    nic text,
    relationship text NOT NULL,
    "isBreadwinner" boolean DEFAULT false NOT NULL,
    "isStudent" boolean DEFAULT false NOT NULL,
    school text,
    grade text,
    occupation text,
    "monthlyEarnings" double precision,
    "maritalStatus" text,
    "dateOfDemise" timestamp(3) without time zone,
    attachments text[],
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "familyCardId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    email text,
    phone text
);


ALTER TABLE public."FamilyMember" OWNER TO postgres;

--
-- Name: FundAppointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FundAppointment" (
    id text NOT NULL,
    "fundRequestId" text NOT NULL,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    location text,
    purpose text,
    outcome text,
    attended boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FundAppointment" OWNER TO postgres;

--
-- Name: FundDisbursement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FundDisbursement" (
    id text NOT NULL,
    "fundRequestId" text NOT NULL,
    amount double precision NOT NULL,
    method public."DisbursementMethod" NOT NULL,
    "chequeNumber" text,
    "bankReference" text,
    "handedOverDate" timestamp(3) without time zone NOT NULL,
    "assignedMembers" text,
    attachments text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FundDisbursement" OWNER TO postgres;

--
-- Name: FundQuotation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FundQuotation" (
    id text NOT NULL,
    "fundRequestId" text NOT NULL,
    vendor text NOT NULL,
    amount double precision NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    attachments text[],
    "isGranted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."FundQuotation" OWNER TO postgres;

--
-- Name: FundRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FundRequest" (
    id text NOT NULL,
    "committeeId" text NOT NULL,
    "committeeTermId" text NOT NULL,
    "projectName" text,
    "beneficiaryType" public."BeneficiaryType" NOT NULL,
    "familyMemberId" text,
    "externalName" text,
    "externalPhone" text,
    "externalAddress" text,
    purpose text NOT NULL,
    description text,
    "requestedAmount" double precision,
    verified boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text,
    "grantedAmount" double precision,
    status public."FundRequestStatus" DEFAULT 'RECEIVED'::public."FundRequestStatus" NOT NULL,
    "decisionNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    attachments text[] DEFAULT ARRAY[]::text[],
    "letterRefNo" text,
    "durationMonths" integer,
    "paymentType" public."PaymentType" DEFAULT 'ONE_TIME'::public."PaymentType" NOT NULL,
    "totalDisbursed" double precision DEFAULT 0 NOT NULL,
    "endMonth" text,
    "startMonth" text
);


ALTER TABLE public."FundRequest" OWNER TO postgres;

--
-- Name: FundRequestEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FundRequestEvent" (
    id text NOT NULL,
    "fundRequestId" text NOT NULL,
    action text NOT NULL,
    "performedBy" text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FundRequestEvent" OWNER TO postgres;

--
-- Name: Investigation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Investigation" (
    id text NOT NULL,
    "fundRequestId" text NOT NULL,
    investigators text NOT NULL,
    "visitDate" timestamp(3) without time zone NOT NULL,
    findings text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "actualVisitDate" timestamp(3) without time zone,
    "attendedMembers" text,
    attachments text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public."Investigation" OWNER TO postgres;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNo" text NOT NULL,
    amount double precision NOT NULL,
    status public."InvoiceStatus" DEFAULT 'UNPAID'::public."InvoiceStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "licensePlanId" text NOT NULL,
    "mainMahallaId" text,
    "registrationRequestId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO postgres;

--
-- Name: LicensePlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LicensePlan" (
    id text NOT NULL,
    name text NOT NULL,
    type public."PlanType" DEFAULT 'MONTHLY'::public."PlanType" NOT NULL,
    "basePrice" double precision NOT NULL,
    "salePrice" double precision,
    "isSaleActive" boolean DEFAULT false NOT NULL,
    description text,
    features text[],
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "featureConfig" jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public."LicensePlan" OWNER TO postgres;

--
-- Name: MainMahalla; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MainMahalla" (
    id text NOT NULL,
    name text NOT NULL,
    logo text,
    "coverImage" text,
    "registeredDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text,
    address text,
    country text,
    province text,
    district text,
    area text,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "defaultCurrency" text DEFAULT 'LKR'::text NOT NULL,
    "activatedDate" timestamp(3) without time zone,
    "deactivatedDate" timestamp(3) without time zone,
    phone text,
    "licensePlanId" text
);


ALTER TABLE public."MainMahalla" OWNER TO postgres;

--
-- Name: MasterArea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterArea" (
    id text NOT NULL,
    name text NOT NULL,
    "districtId" text NOT NULL
);


ALTER TABLE public."MasterArea" OWNER TO postgres;

--
-- Name: MasterCountry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterCountry" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    currency text NOT NULL,
    "currencyDecimalPlaces" integer DEFAULT 2 NOT NULL
);


ALTER TABLE public."MasterCountry" OWNER TO postgres;

--
-- Name: MasterDistrict; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterDistrict" (
    id text NOT NULL,
    name text NOT NULL,
    "provinceId" text NOT NULL
);


ALTER TABLE public."MasterDistrict" OWNER TO postgres;

--
-- Name: MasterGrade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterGrade" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."MasterGrade" OWNER TO postgres;

--
-- Name: MasterOccupation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterOccupation" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."MasterOccupation" OWNER TO postgres;

--
-- Name: MasterProvince; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterProvince" (
    id text NOT NULL,
    name text NOT NULL,
    "countryId" text NOT NULL
);


ALTER TABLE public."MasterProvince" OWNER TO postgres;

--
-- Name: MasterSchool; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterSchool" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."MasterSchool" OWNER TO postgres;

--
-- Name: OpeningBalanceCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OpeningBalanceCategory" (
    id text NOT NULL,
    name text NOT NULL,
    "mainMahallaId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OpeningBalanceCategory" OWNER TO postgres;

--
-- Name: OtpVerification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OtpVerification" (
    id text NOT NULL,
    email text NOT NULL,
    otp text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OtpVerification" OWNER TO postgres;

--
-- Name: ProjectMaster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectMaster" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "committeeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProjectMaster" OWNER TO postgres;

--
-- Name: RegistrationRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RegistrationRequest" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "mahallaName" text NOT NULL,
    "selfieUrl" text,
    "governmentIdUrl" text,
    status public."RegistrationStatus" DEFAULT 'PENDING'::public."RegistrationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    country text,
    district text,
    province text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "licensePlanId" text
);


ALTER TABLE public."RegistrationRequest" OWNER TO postgres;

--
-- Name: RequestCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RequestCategory" (
    id text NOT NULL,
    name text NOT NULL,
    "committeeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RequestCategory" OWNER TO postgres;

--
-- Name: SubMahalla; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SubMahalla" (
    id text NOT NULL,
    name text NOT NULL,
    logo text,
    "coverImage" text,
    "registeredDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text,
    address text,
    area text,
    "mainMahallaId" text NOT NULL,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SubMahalla" OWNER TO postgres;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "mainMahallaId" text NOT NULL,
    "licensePlanId" text NOT NULL,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "nextInvoiceDate" timestamp(3) without time zone NOT NULL,
    "lastInvoicedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO postgres;

--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSettings" (
    id text DEFAULT 'global'::text NOT NULL,
    "smtpHost" text,
    "smtpPort" integer,
    "smtpUser" text,
    "smtpPassword" text,
    "smtpFromEmail" text,
    "smtpFromName" text,
    "smtpEncryption" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "recaptchaSecretKey" text,
    "recaptchaSiteKey" text,
    "accountHolder" text,
    "accountNumber" text,
    "bankInstructions" text,
    "bankName" text,
    "logoUrl" text
);


ALTER TABLE public."SystemSettings" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role public."Role" DEFAULT 'MEMBER'::public."Role" NOT NULL,
    "mainMahallaId" text,
    "subMahallaId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "committeeId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Committee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Committee" (id, name, description, logo, "shortCode", "establishedDate", "registrationNo", address, email, "contactNo", website, "bankName", "accountNumber", "accountHolderName", branch, "defaultCurrency", status, "mainMahallaId", "createdAt", "updatedAt", "subMahallaId", "allowMainMahallaView") FROM stdin;
cmopesdnl001sv9rj43597w7h	wJ Baithuz zakath		/uploads/committees/1777790879147-logo.png	WBZ	2010-01-01 00:00:00										LKR	ACTIVE	cmott3w84000bv982gjm9ym5l	2026-05-03 06:47:59.163	2026-05-03 06:47:59.163	\N	f
cmost7s8v0003v921jdzdejvy	Muhaideen Masjid board of trustees		\N	MMBOT	\N										LKR	ACTIVE	cmott3w84000bv982gjm9ym5l	2026-05-05 15:55:11.08	2026-05-06 01:06:04.744	cmoqxa6pb000ov9smnmad6fan	t
\.


--
-- Data for Name: CommitteeMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommitteeMember" (id, role, "committeeTermId", "familyMemberId", "hasDashboardAccess", "createdAt", "updatedAt", "activeDateFrom", "activeDateTo", status) FROM stdin;
cmople0e8002mv9rju45eguaj	President	cmopetq24001uv9rj4bdzwmxt	cmopedqd4001av9rju0i9v8nq	f	2026-05-03 09:52:46.204	2026-05-03 09:57:56.616	\N	\N	ACTIVE
cmopleb78002ov9rjrawh5zs2	Member	cmopetq24001uv9rj4bdzwmxt	cmopen8we001mv9rjwq5f50e9	f	2026-05-03 09:53:00.204	2026-05-03 10:01:44.659	\N	\N	ACTIVE
cmopo3ni8000bv9lxlzp9pq1e	Treasurer	cmopetq24001uv9rj4bdzwmxt	cmopeo0ro001ov9rjodfxr2ck	f	2026-05-03 11:08:41.792	2026-05-03 11:08:41.792	\N	\N	ACTIVE
cmopo3ej20009v9lx6aoja5v0	Member	cmopetq24001uv9rj4bdzwmxt	cmopefmei001cv9rj7l3arpc5	f	2026-05-03 11:08:30.156	2026-05-03 12:02:47.44	\N	\N	ACTIVE
cmostpnbv0007v9211h6c18ds	Member	cmostheub0005v921uyz95dza	cmor5hecv0005v9atxsw9nrk3	f	2026-05-05 16:09:04.595	2026-05-05 16:09:04.595	\N	\N	ACTIVE
cmostptjt0009v921pxu2trmv	Member	cmostheub0005v921uyz95dza	cmor5immx0007v9atlw7edfg2	f	2026-05-05 16:09:12.665	2026-05-05 16:09:12.665	\N	\N	ACTIVE
\.


--
-- Data for Name: CommitteeTerm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommitteeTerm" (id, name, "startDate", "endDate", status, "committeeId", "createdAt", "updatedAt", "financialsApprovedAt", "financialsStatus") FROM stdin;
cmopetq24001uv9rj4bdzwmxt	Zakath committee - 2025	2025-08-01 00:00:00	2028-07-31 00:00:00	ACTIVE	cmopesdnl001sv9rj43597w7h	2026-05-03 06:49:01.982	2026-05-03 11:02:35.872	2026-05-03 11:02:35.87	APPROVED
cmostheub0005v921uyz95dza	2026-2029	2026-05-01 00:00:00	2029-04-30 00:00:00	ACTIVE	cmost7s8v0003v921jdzdejvy	2026-05-05 16:02:40.346	2026-05-05 16:02:40.346	\N	PENDING
\.


--
-- Data for Name: CommitteeTermBalance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommitteeTermBalance" (id, amount, "committeeTermId", "categoryId", "createdAt", "updatedAt") FROM stdin;
cmopnlrq40001v9lxcamajkfs	500000	cmopetq24001uv9rj4bdzwmxt	cmopnjram0001v9keihcc8f2r	2026-05-03 10:54:47.452	2026-05-03 11:02:27.654
cmopnvmtl0007v9lxx1u2ufk6	150000	cmopetq24001uv9rj4bdzwmxt	cmopnvejq0003v9lxf66qbazb	2026-05-03 11:02:27.654	2026-05-03 11:02:27.654
\.


--
-- Data for Name: Donation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Donation" (id, amount, date, "paymentMethod", reference, "donorId", "committeeId", "committeeTermId", "mainMahallaId", "createdAt", "updatedAt", "attachmentUrl") FROM stdin;
cmopp11ry0003v9ekmi9a31pg	1000000	2026-05-03 00:00:00	CASH		cmopp11qh0001v9ekt93v3s8x	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	cmop7ehze0001v9rjwpytuz1w	2026-05-03 11:34:39.934	2026-05-03 11:34:39.934	\N
cmopp2leq0007v9ekx9pcb4kk	200000	2026-05-03 00:00:00	CHEQUE		cmopp2ldo0005v9ekbxtuj13y	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	cmop7ehze0001v9rjwpytuz1w	2026-05-03 11:35:52.035	2026-05-03 11:35:52.035	\N
cmopuzgbo0004v9e8psuwmpks	800000	2026-05-03 00:00:00	CASH	\N	cmopuzg8w0001v9e8p5p4xsfe	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	cmop7ehze0001v9rjwpytuz1w	2026-05-03 14:21:23.172	2026-05-03 14:21:23.172	\N
cmopvcxk40008v9e8zi7qgdnw	50000	2026-05-03 00:00:00	CASH	\N	cmopvcxj20006v9e8av6gpakw	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	cmop7ehze0001v9rjwpytuz1w	2026-05-03 14:31:52.037	2026-05-03 14:31:52.037	\N
cmopvowhj0003v9gulx1dn9xd	25000	2026-05-03 00:00:00	CASH	4324324	cmopvowf10001v9guyieo24zs	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	cmop7ehze0001v9rjwpytuz1w	2026-05-03 14:41:10.519	2026-05-03 14:41:10.519	6e19fee6b47b36ca613f.png
cmopvx6xq0007v9gu28k49ib4	150000	2026-05-03 00:00:00	CASH		cmopp2ldo0005v9ekbxtuj13y	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	cmop7ehze0001v9rjwpytuz1w	2026-05-03 14:47:37.309	2026-05-03 14:47:37.309	\N
cmotdkpew0003v988slo0a13p	300000	2026-05-06 00:00:00	CHEQUE	53234534	cmotdkpat0001v988zsgqyogd	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	cmop7ehze0001v9rjwpytuz1w	2026-05-06 01:25:06.345	2026-05-06 01:25:06.345	\N
\.


--
-- Data for Name: Donor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Donor" (id, type, name, phone, email, "familyMemberId", "mainMahallaId", "createdAt", "updatedAt", "subMahallaId") FROM stdin;
cmopp11qh0001v9ekt93v3s8x	EXTERNAL	MMM Rice mill - MR. JANAH	92800119	JANAH@Mail.com	\N	cmott3w84000bv982gjm9ym5l	2026-05-03 11:34:39.872	2026-05-03 11:34:39.872	\N
cmopuzg8w0001v9e8p5p4xsfe	EXTERNAL	RAAS	92800119	reyaas240@gmail.com	\N	cmott3w84000bv982gjm9ym5l	2026-05-03 14:21:23.065	2026-05-03 14:21:23.065	\N
cmopvowf10001v9guyieo24zs	EXTERNAL	NAADI	435453453	4543543543534	\N	cmott3w84000bv982gjm9ym5l	2026-05-03 14:41:10.417	2026-05-03 14:41:10.417	\N
cmopvcxj20006v9e8av6gpakw	INTERNAL	Bisnari	9838949834	re@mail.com	cmopepb9k001qv9rj3g07jgyk	cmott3w84000bv982gjm9ym5l	2026-05-03 14:31:51.998	2026-05-04 05:33:13.47	\N
cmopp2ldo0005v9ekbxtuj13y	INTERNAL	Mohammed Jabbar	873949249	rewr@mail.com	cmopedqd4001av9rju0i9v8nq	cmott3w84000bv982gjm9ym5l	2026-05-03 11:35:51.994	2026-05-04 05:33:25.871	\N
cmotdkpat0001v988zsgqyogd	EXTERNAL	Mr. Geena	07688342923432		\N	cmott3w84000bv982gjm9ym5l	2026-05-06 01:25:06.197	2026-05-06 01:25:06.197	\N
\.


--
-- Data for Name: DonorContact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DonorContact" (id, name, phone, whatsapp, email, "donorId", "createdAt", "updatedAt") FROM stdin;
cmopuzg8w0002v9e82cnnkujw	Ahmed Bin Majid Pvt School	0767740428	0767740428	reyaas240@gmail.com	cmopuzg8w0001v9e8p5p4xsfe	2026-05-03 14:21:23.065	2026-05-03 14:21:23.065
\.


--
-- Data for Name: FamilyCard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FamilyCard" (id, "mainMahallaCardNo", "subMahallaCardNo", "registeredDate", "livingType", "livingFromDate", attachments, status, "subMahallaId", "createdAt", "updatedAt", address, latitude, longitude) FROM stdin;
cmopemi8g001kv9rjkj6kf3f6	101	101	2026-05-03 06:43:25.264	OWN_HOUSE	2010-06-03 00:00:00	\N	ACTIVE	cmop7gnbg000cv9rj9cafk3ob	2026-05-03 06:43:25.264	2026-05-03 06:43:25.264	\N	\N	\N
cmoqfvgwd000fv9ponydofoca	102	102	2026-05-04 00:06:09.228	RENTED	2023-01-05 00:00:00	\N	ACTIVE	cmop7gnbg000cv9rj9cafk3ob	2026-05-04 00:06:09.228	2026-05-04 00:06:09.228	\N	\N	\N
cmor5gik70003v9atp6fgc8l7	1100	500	2026-05-04 12:02:21.558	OWN_HOUSE	1998-01-01 00:00:00	\N	ACTIVE	cmoqxa6pb000ov9smnmad6fan	2026-05-04 12:02:21.558	2026-05-04 12:02:21.558	\N	\N	\N
cmor9bgjd0001v9rsp3idilva	1003	1003	2026-05-04 13:50:24.12	OWN_HOUSE	\N	{/uploads/families/1777902624108-First-Term-Parent–Teacher-Interaction-(PTI)-(1).png,/uploads/families/1777903166485-timetablechange.png}	ACTIVE	cmop7gnbg000cv9rj9cafk3ob	2026-05-04 13:50:24.12	2026-05-04 13:59:26.491	64, kandy road, warakamura, ukuwela, sri lanka	\N	\N
cmorcia1v0005v9rsriif14ya	1300	501	2026-05-04 15:19:41.155	OWN_HOUSE	\N	{/uploads/families/1777908289197-timetablechange.png,/uploads/families/1777908318665-Automated.png}	ACTIVE	cmoqxa6pb000ov9smnmad6fan	2026-05-04 15:19:41.155	2026-05-04 15:25:18.668	54, mattawa	\N	\N
cmopec89o0018v9rj16h9jlho	100	100	2026-05-03 06:35:25.781	OWN_HOUSE	2005-06-17 00:00:00	{/uploads/families/1777944568941-maydayNotice.png}	ACTIVE	cmop7gnbg000cv9rj9cafk3ob	2026-05-03 06:35:25.781	2026-05-05 01:49:14.024	67, NNN road, Warakamura	\N	\N
cmos6ef0m001lv9i0ui6g82eg	1004	501	2026-05-05 05:16:29.446	RENTED	2019-01-02 00:00:00	{}	ACTIVE	cmop7gnbg000cv9rj9cafk3ob	2026-05-05 05:16:29.446	2026-05-05 05:16:29.446	90, KK Road, WM	\N	\N
cmos6jdlr001tv9i01g56aavv	1005	503	2026-05-05 05:20:20.895	OWN_HOUSE	1983-03-01 00:00:00	{}	ACTIVE	cmop7gnbg000cv9rj9cafk3ob	2026-05-05 05:20:20.895	2026-05-05 05:20:20.895	76, MNM Road, WM	\N	\N
cmostu5wy000dv921958kyd95	1300	501	2026-05-05 16:12:35.314	OWN_HOUSE	1990-01-05 00:00:00	{}	ACTIVE	cmostt0v2000bv921p080uzp4	2026-05-05 16:12:35.314	2026-05-05 16:12:35.314	187, MMMMM St, Matale	\N	\N
cmotkyv6c0005v9vskgkgwo5j	100	100	2026-05-06 04:52:04.308	OWN_HOUSE	2009-01-24 00:00:00	{}	ACTIVE	cmotk04br0001v9vsa3lsqm4h	2026-05-06 04:52:04.308	2026-05-06 04:52:04.308	6000, matale	\N	\N
\.


--
-- Data for Name: FamilyMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FamilyMember" (id, title, "fullName", dob, nic, relationship, "isBreadwinner", "isStudent", school, grade, occupation, "monthlyEarnings", "maritalStatus", "dateOfDemise", attachments, status, "familyCardId", "createdAt", "updatedAt", email, phone) FROM stdin;
cmor9ck1v0003v9rszhal41w6	Mr.	Sanis	1981-07-17 00:00:00	19819834982	Head	t	f	\N	\N	mechanic	0	Married	\N	\N	ACTIVE	cmor9bgjd0001v9rsp3idilva	2026-05-04 13:51:15.33	2026-05-04 13:51:15.33	\N	077284842424
cmorck1ik0007v9rse7zancug	Mrs.	Neeka	1966-10-07 00:00:00	19697834324	Head	t	f	\N	\N	Daily Worker	0	Widowed	\N	\N	ACTIVE	cmorcia1v0005v9rsriif14ya	2026-05-04 15:21:03.405	2026-05-04 15:21:03.405	\N	\N
cmorcl7he0009v9rsarq3v1ik	Miss.	Katika	2010-06-11 00:00:00	\N	Daughter	f	t	\N	\N	\N	0	Single	\N	\N	ACTIVE	cmorcia1v0005v9rsriif14ya	2026-05-04 15:21:57.777	2026-05-04 15:22:10.938	\N	\N
cmopeipbf001gv9rj2exorjdy	Miss.	Jansi	2017-09-07 00:00:00	\N	Daughter	f	t	MT/W An-Noor Muslim Maha Vidyalaya	KG-Grade10	\N	0	Single	\N	\N	ACTIVE	cmopec89o0018v9rj16h9jlho	2026-05-03 06:40:27.809	2026-05-05 01:28:12.974	\N	\N
cmopehilv001ev9rjfal4v3cx	Miss.	Fida	2007-06-15 00:00:00	3553532452	Daughter	f	t	MT/M Zahira College	G.C.E (A/L)	\N	0	Single	\N	\N	ACTIVE	cmopec89o0018v9rj16h9jlho	2026-05-03 06:39:32.467	2026-05-05 01:28:26.132	\N	\N
cmos6fi0u001nv9i0pugwuqg4	Mr.	Maaricaar	1998-01-05 00:00:00	19987848342	Head	t	f	\N	\N	Electrician	0	Married	\N	\N	ACTIVE	cmos6ef0m001lv9i0ui6g82eg	2026-05-05 05:17:19.998	2026-05-05 05:17:19.998	\N	\N
cmos6ghvz001pv9i0q2z6hxbp	Mrs.	Fathima Maaricaar	1999-02-25 00:00:00	1999838924	Spouse	f	f	\N	\N	Housewife	0	Married	\N	\N	ACTIVE	cmos6ef0m001lv9i0ui6g82eg	2026-05-05 05:18:06.479	2026-05-05 05:18:06.479	\N	\N
cmopeo0ro001ov9rjodfxr2ck	Mrs.	Fathima Bicasi	1986-08-03 00:00:00	34543535	Spouse	f	f	\N	\N		0	Married	\N	\N	ACTIVE	cmopemi8g001kv9rjkj6kf3f6	2026-05-03 06:44:35.939	2026-05-03 06:44:35.939	\N	\N
cmos6hc2t001rv9i0gcf07c0e	Ms.	Jumaan	2024-02-08 00:00:00	\N	Son	f	f	\N	\N		0	Married	\N	\N	ACTIVE	cmos6ef0m001lv9i0ui6g82eg	2026-05-05 05:18:45.586	2026-05-05 05:18:45.586	\N	\N
cmopepb9k001qv9rj3g07jgyk	Mr.	Bisnari	2007-08-30 00:00:00	25234324	Son	f	t	\N	\N	\N	0	Single	\N	\N	ACTIVE	cmopemi8g001kv9rjkj6kf3f6	2026-05-03 06:45:36.2	2026-05-03 06:45:55.859	\N	\N
cmopejzhd001iv9rjwor6iaux	Mr.	Firna	2005-11-03 00:00:00	345435435	Son	f	f	\N	\N	Engineer	0	Single	\N	\N	ACTIVE	cmopec89o0018v9rj16h9jlho	2026-05-03 06:41:27.649	2026-05-03 06:46:32.758	\N	\N
cmoqfw82u000hv9pope9g26q2	Mr.	Nasa	1987-04-04 00:00:00	19876364824	Head	t	f	\N	\N	Mason	0	Married	\N	\N	ACTIVE	cmoqfvgwd000fv9ponydofoca	2026-05-04 00:06:44.453	2026-05-04 00:06:44.453	\N	\N
cmoqfx5fo000jv9po9ze97jg7	Mrs.	Fathima Nasa	1991-08-08 00:00:00	199188434432	Spouse	f	f	\N	\N	Teacher	0	Married	\N	\N	ACTIVE	cmoqfvgwd000fv9ponydofoca	2026-05-04 00:07:27.684	2026-05-04 00:07:27.684	\N	\N
cmoqfyk41000lv9povmokwgin	Miss.	FathiNisa	2012-06-08 00:00:00	\N	Daughter	f	t	\N	\N		0	Single	\N	\N	ACTIVE	cmoqfvgwd000fv9ponydofoca	2026-05-04 00:08:33.302	2026-05-04 00:08:33.302	\N	\N
cmopedqd4001av9rju0i9v8nq	Mr.	Mohammed Jabbar	1969-11-20 00:00:00	265353345	Head	t	f	\N	\N	Businessman	0	Married	\N	\N	ACTIVE	cmopec89o0018v9rj16h9jlho	2026-05-03 06:36:35.896	2026-05-04 05:47:19.324	reyaas240@gmail.com	92800119
cmopefmei001cv9rj7l3arpc5	Miss.	Fathima Jabbar	1978-01-04 00:00:00	23234324324	Spouse	f	f	\N	\N	Teacher	0	Married	\N	\N	ACTIVE	cmopec89o0018v9rj16h9jlho	2026-05-03 06:38:04.074	2026-05-04 05:47:24.185	\N	0761351036
cmopen8we001mv9rjwq5f50e9	Mr.	Bicasi	1983-11-19 00:00:00	24324324	Head	t	f	\N	\N	Businessman	0	Married	\N	\N	ACTIVE	cmopemi8g001kv9rjkj6kf3f6	2026-05-03 06:43:59.822	2026-05-04 05:47:50.047	bica@gmail.com	0767740428
cmor5hecv0005v9atxsw9nrk3	Mr.	Kana	1984-03-08 00:00:00	19847724242	Head	t	f	\N	\N	Businessman	0	Married	\N	\N	ACTIVE	cmor5gik70003v9atp6fgc8l7	2026-05-04 12:03:02.768	2026-05-04 12:03:02.768	\N	072363284
cmor5immx0007v9atlw7edfg2	Mrs.	Kamili Kana	1989-01-13 00:00:00	19897837432	Spouse	f	f	\N	\N	Housewife	0	Married	\N	\N	ACTIVE	cmor5gik70003v9atp6fgc8l7	2026-05-04 12:04:00.153	2026-05-04 12:04:00.153	\N	\N
cmostv8x4000fv921d68rdz5f	Mr.	M J M Mooooo	1975-08-15 00:00:00	19759904234	Head	t	f	\N	\N	Engineer	0	Married	\N	\N	ACTIVE	cmostu5wy000dv921958kyd95	2026-05-05 16:13:25.864	2026-05-05 16:13:25.864	\N	\N
cmostwgpn000hv921lyej0zzc	Mrs.	Fathima Mooooos	1983-03-06 00:00:00	198378934432	Spouse	f	f	\N	\N	Housewife	0	Married	\N	\N	ACTIVE	cmostu5wy000dv921958kyd95	2026-05-05 16:14:22.618	2026-05-05 16:14:22.618	\N	\N
cmotkzkw10007v9vsexc31606	Mr.	Jaaaanis	1969-03-09 00:00:00	1969894832423	Head	t	f	\N	\N	Engineer	0	Married	\N	\N	ACTIVE	cmotkyv6c0005v9vskgkgwo5j	2026-05-06 04:52:37.631	2026-05-06 04:52:37.631	\N	\N
\.


--
-- Data for Name: FundAppointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FundAppointment" (id, "fundRequestId", "scheduledDate", location, purpose, outcome, attended, "createdAt") FROM stdin;
cmoqjeu660001v9w43kzqp931	cmopz6kfu0001v9por8684158	2026-05-09 00:00:00	\N	Initial inquiry	Attended and explained their requirements.	t	2026-05-04 01:45:11.741
cmos4yquy000tv9i0ee8v9jyx	cmos4w1uz000lv9i06ynfa5l5	2026-05-05 00:00:00	\N	To take more details	Enquire did and explained his new business which he has experience.	t	2026-05-05 04:36:18.682
\.


--
-- Data for Name: FundDisbursement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FundDisbursement" (id, "fundRequestId", amount, method, "chequeNumber", "bankReference", "handedOverDate", "assignedMembers", attachments, "createdAt") FROM stdin;
cmos1nqqc0001v95fqt18tkh0	cmopz6kfu0001v9por8684158	225000	CASH	788423432	34543535	2026-05-04 00:00:00	Mohammed Jabbar, Bicasi	{/uploads/requests/1777868188584-he-she-it-worksheet.jpg,/uploads/requests/1777868188638-timetablechange.jpg}	2026-05-04 04:16:28.712
cmos1nqqi0003v95ffsmmzgzn	cmoqq2mrg0011v9luo91l1py5	100000	CHEQUE	343534324	\N	2026-05-04 00:00:00	\N	{}	2026-05-04 16:11:47.055
cmos1nqqk0005v95f2z05ui5g	cmoqgeup10001v9wx749lpmv0	350000	CASH	353535423	342324234	2026-05-04 00:00:00	Mohammed Jabbar	{/uploads/requests/1777868817062-2026-(10).jpg}	2026-05-04 04:26:57.13
cmos3y5ks0003v9i0hagrsnv4	cmoqmbh3n0009v9w4f9es823d	100000	CASH	792432423	\N	2026-05-05 00:00:00	\N	{}	2026-05-05 04:07:51.483
cmos40gkx0009v9i0nm50nuds	cmos2pyju000hv98x82neo6ef	6000	CHEQUE	243243243	\N	2026-05-05 00:00:00	\N	{}	2026-05-05 04:09:39.057
cmos50p320011v9i0uh73khd1	cmos4w1uz000lv9i06ynfa5l5	300000	CASH	\N	\N	2026-05-05 00:00:00	\N	{}	2026-05-05 04:37:49.694
cmos5ymz90019v9i0ax71hump	cmos2pyju000hv98x82neo6ef	6000	CASH	\N	\N	2026-06-01 00:00:00	\N	{}	2026-05-05 05:04:13.269
cmos5zoeo001dv9i01x2b8sdq	cmos2pyju000hv98x82neo6ef	6000	CASH	\N	\N	2026-05-05 00:00:00	\N	{}	2026-05-05 05:05:01.777
cmos65b5e001hv9i0iqosmtma	cmos2pyju000hv98x82neo6ef	6000	CASH	\N	\N	2026-05-05 00:00:00	\N	{}	2026-05-05 05:09:24.53
\.


--
-- Data for Name: FundQuotation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FundQuotation" (id, "fundRequestId", vendor, amount, description, "createdAt", attachments, "isGranted") FROM stdin;
cmoqjo55h0005v9w4pq71y2zk	cmopz6kfu0001v9por8684158	Zakeer Hw	50005	Quotation for building material	2026-05-04 01:52:25.875	{/uploads/requests/1777865658092-First-Term-Parent–Teacher-Interaction-(PTI)-(1).jpg,/uploads/requests/1777865658175-9-COMM.pdf}	f
cmoqp38l6000dv9lupddoasgx	cmoqgeup10001v9wx749lpmv0	KLM HW	260000	Reg	2026-05-04 04:24:08.248	{/uploads/requests/1777868648122-timetablechange.jpg}	f
cmoqp2ry80009v9luqzpwaswz	cmoqgeup10001v9wx749lpmv0	NM HW	250000	test	2026-05-04 04:23:46.687	{/uploads/requests/1777868626584-maydayNotice.jpg}	t
cmoqp5lot000jv9luzuf8ejtr	cmoqgeup10001v9wx749lpmv0	Lafeer Bass	100000	fsfsf	2026-05-04 04:25:58.54	{/uploads/requests/1777868758442-maydayNotice.jpg}	t
\.


--
-- Data for Name: FundRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FundRequest" (id, "committeeId", "committeeTermId", "projectName", "beneficiaryType", "familyMemberId", "externalName", "externalPhone", "externalAddress", purpose, description, "requestedAmount", verified, "verifiedAt", "verifiedBy", "grantedAmount", status, "decisionNotes", "createdAt", "updatedAt", attachments, "letterRefNo", "durationMonths", "paymentType", "totalDisbursed", "endMonth", "startMonth") FROM stdin;
cmopz6kfu0001v9por8684158	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	\N	INTERNAL	cmopeo0ro001ov9rjodfxr2ck	\N	\N	\N	Emergency	Required to settle some emergency loan.	400000	t	2026-05-03 16:19:05.689	Reyaas	225000	DISBURSED	After committee discussion, analysing all the required matters approve Rs. two hundred twenty five thousand rupees.	2026-05-03 16:18:53.56	2026-05-05 03:03:46.456	{}	\N	\N	ONE_TIME	225000	\N	\N
cmoqq2mrg0011v9luo91l1py5	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	\N	INTERNAL	cmopeo0ro001ov9rjodfxr2ck	\N	\N	\N	Medical	Requesting help for monthly medical expenses	60000	t	2026-05-04 04:51:46.444	Reyaas	100000	DISBURSED	Passed Rs Hundred thousands only after committee discussion.	2026-05-04 04:51:39.578	2026-05-05 03:03:46.459	{/uploads/requests/1777870299359-he-she-it-worksheet.jpg}	155	\N	ONE_TIME	100000	\N	\N
cmoqgeup10001v9wx749lpmv0	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	\N	EXTERNAL	\N	Jansi Rani	9829489242	\N	Emergency	Request for some loan settlement.	10000	f	\N	\N	350000	DISBURSED	material and bass	2026-05-04 00:21:13.571	2026-05-05 03:03:46.461	{/uploads/requests/1777868544827-he-she-it-worksheet.jpg}	\N	\N	ONE_TIME	350000	\N	\N
cmoqfzxgo000nv9pooql1o8sm	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	\N	INTERNAL	cmoqfx5fo000jv9po9ze97jg7	\N	\N	\N	Medical	Requesting monthly medical expenses	\N	f	\N	\N	\N	ON_HOLD	Not able to provide the requirement	2026-05-04 00:09:37.319	2026-05-04 04:35:32.905	{}	\N	\N	ONE_TIME	0	\N	\N
cmos2pyju000hv98x82neo6ef	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	2026 Fund Distribution	INTERNAL	cmorck1ik0007v9rse7zancug	\N	\N	\N	Living Support	testing	10000	t	2026-05-05 03:33:33.284	Reyaas	6000	ON_GOING	Decision has taken to pay Rs 6,000 for 7 months till Dec2026	2026-05-05 03:33:29.514	2026-05-05 05:09:24.539	{}	156	7	MONTHLY	24000	2026-12	2026-06
cmoqmbh3n0009v9w4f9es823d	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	\N	INTERNAL	cmoqfw82u000hv9pope9g26q2	\N	\N	\N	Housing	requested for housing.	600000	t	2026-05-05 04:05:05.02	Reyaas	100000	DISBURSED	decided to pay Rs 100,000	2026-05-04 03:06:33.681	2026-05-05 04:07:51.491	{/uploads/requests/1777865183835-Teacher-vacancies.jpg,/uploads/requests/1777865199141-9-COMM-1.pdf}	\N	\N	ONE_TIME	100000	\N	\N
cmos51wea0015v9i0ktdxu99l	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	2026 Fund Distribution	INTERNAL	cmor5hecv0005v9atxsw9nrk3	\N	\N	\N	Employment	testing	200000	t	2026-05-06 01:42:24.524	Reyaas	\N	UNDER_DISCUSSION	\N	2026-05-05 04:38:45.826	2026-05-06 01:42:24.533	{}	159	\N	ONE_TIME	0	\N	\N
cmos4tfya000dv9i0puz7n48r	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	2026 Fund Distribution	INTERNAL	cmor9ck1v0003v9rszhal41w6	\N	\N	\N	Housing	reequired land	1000000	t	2026-05-05 04:32:16.173	Reyaas	\N	REJECTED	Not able to provide land requirement.	2026-05-05 04:32:11.266	2026-05-05 04:32:43.88	{}	157	\N	ONE_TIME	0	\N	\N
cmos4w1uz000lv9i06ynfa5l5	cmopesdnl001sv9rj43597w7h	cmopetq24001uv9rj4bdzwmxt	2026 Fund Distribution	INTERNAL	cmor9ck1v0003v9rszhal41w6	\N	\N	\N	Self Employment	Required fund to start his own business	400000	f	\N	\N	300000	DISBURSED	After having discussion with the person, committee decided to pay Rs 300,000.	2026-05-05 04:34:12.972	2026-05-05 04:37:49.701	{}	158	\N	ONE_TIME	300000	\N	\N
\.


--
-- Data for Name: FundRequestEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FundRequestEvent" (id, "fundRequestId", action, "performedBy", note, "createdAt") FROM stdin;
cmopz6kgm0003v9pop3z95cow	cmopz6kfu0001v9por8684158	Request received	Reyaas	New internal request for: Emergency	2026-05-03 16:18:53.59
cmopz6tt20005v9pomr4d283x	cmopz6kfu0001v9por8684158	Beneficiary verified	Reyaas	Family card verification completed successfully	2026-05-03 16:19:05.702
cmopz8pue0009v9poskk0p79l	cmopz6kfu0001v9por8684158	Investigation added	Reyaas	Field visit by: TEsti	2026-05-03 16:20:33.879
cmopz99x6000dv9po8m96b1fa	cmopz6kfu0001v9por8684158	Investigation added	Reyaas	Field visit by: jjsdfs f, ksdfkdsjfds, dskfdskfkjalfaf	2026-05-03 16:20:59.899
cmoqfzxgw000pv9poi2n9nmr6	cmoqfzxgo000nv9pooql1o8sm	Request received	Reyaas	New internal request for: Medical	2026-05-04 00:09:37.329
cmoqgeuq80003v9wxx8bfd9w5	cmoqgeup10001v9wx749lpmv0	Request received	Reyaas	New external request for: Emergency	2026-05-04 00:21:13.616
cmoqhj5xx0007v9wxv0wq7fhv	cmopz6kfu0001v9por8684158	Investigation added	Reyaas	Field visit by: Mohammed Jabbar, Fathima Jabbar, Fathima Bicasi	2026-05-04 00:52:34.39
cmoqjeu7f0003v9w4p6lkzj1h	cmopz6kfu0001v9por8684158	Appointment scheduled	Reyaas	Inquiry at: Office on 2026-05-09	2026-05-04 01:45:11.788
cmoqjo5690007v9w4iuhjwu7b	cmopz6kfu0001v9por8684158	Quotation attached	Reyaas	Vendor: jdfd — Amount: 50005	2026-05-04 01:52:25.906
cmoqmbh75000bv9w4gruem98f	cmoqmbh3n0009v9w4f9es823d	Request received	Reyaas	New internal request for: Housing	2026-05-04 03:06:33.81
cmoqn0zn3000dv9w443ance9g	cmoqmbh3n0009v9w4f9es823d	Request updated	Reyaas	Request details modified	2026-05-04 03:26:24.108
cmoqn1bd4000fv9w4gwulnu6m	cmoqmbh3n0009v9w4f9es823d	Request updated	Reyaas	Request details modified	2026-05-04 03:26:39.305
cmoqnb5hh0001v9pm2dp9vv91	cmopz6kfu0001v9por8684158	Quotation updated	Reyaas	Vendor: jdfd — Amount: 50005	2026-05-04 03:34:18.245
cmoqo5mzc0003v9pm0tg4ng0p	cmopz6kfu0001v9por8684158	Quotation updated	Reyaas	Vendor: Zakeer Hw — Amount: 50005	2026-05-04 03:58:00.6
cmoqoezxg0001v920uhp9rn0x	cmopz6kfu0001v9por8684158	Appointment completed	Reyaas	Attended and explained their requirements.	2026-05-04 04:05:17.284
cmoqoiwk40003v920t31t46m6	cmopz6kfu0001v9por8684158	Request approved	Reyaas	Granted: 225000. After committee discussion, analysing all the required matters approve Rs. two hundred twenty five thousand rupees.	2026-05-04 04:08:19.54
cmoqote0v0001v9luoryu4vj3	cmopz6kfu0001v9por8684158	Funds disbursed	Reyaas	Method: CASH. Assigned to: Mohammed Jabbar, Bicasi	2026-05-04 04:16:28.735
cmoqp10wb0003v9lu839x3rb0	cmoqgeup10001v9wx749lpmv0	Request updated	Reyaas	Request details modified	2026-05-04 04:22:24.971
cmoqp1nff0007v9lu34sm0rln	cmoqgeup10001v9wx749lpmv0	Investigation added	Reyaas	Field visit by: Bicasi, Mohammed Jabbar	2026-05-04 04:22:54.171
cmoqp2rys000bv9lu7u7739mn	cmoqgeup10001v9wx749lpmv0	Quotation attached	Reyaas	Vendor: NM HW — Amount: 250000	2026-05-04 04:23:46.708
cmoqp38lu000fv9lugmcx083v	cmoqgeup10001v9wx749lpmv0	Quotation attached	Reyaas	Vendor: KLM HW — Amount: 260000	2026-05-04 04:24:08.274
cmoqp3ejq000hv9lusje5qcl3	cmoqgeup10001v9wx749lpmv0	Quotation updated	Reyaas	Vendor: NM HW — Amount: 250000 — Granted: Yes	2026-05-04 04:24:15.975
cmoqp5lp2000lv9luest76rqb	cmoqgeup10001v9wx749lpmv0	Quotation attached	Reyaas	Vendor: Lafeer Bass — Amount: 100000	2026-05-04 04:25:58.55
cmoqp6g30000nv9lum95fivq7	cmoqgeup10001v9wx749lpmv0	Request approved	Reyaas	Granted: 350000. material and bass	2026-05-04 04:26:37.932
cmoqp6uwg000pv9luc5bzt4lk	cmoqgeup10001v9wx749lpmv0	Funds disbursed	Reyaas	Method: CASH. Assigned to: Mohammed Jabbar	2026-05-04 04:26:57.137
cmoqp71ch000rv9lu715jxlxf	cmoqgeup10001v9wx749lpmv0	Disbursement follow-up updated	Reyaas	Assigned to: Mohammed Jabbar	2026-05-04 04:27:05.49
cmoqp8dc5000tv9luzdq3h9g0	cmoqmbh3n0009v9w4f9es823d	Request put on hold	Reyaas	put on hold, not in a position to provide their requirements	2026-05-04 04:28:07.686
cmoqpbro4000vv9lukig7mpv3	cmoqmbh3n0009v9w4f9es823d	Review resumed	Reyaas	Request moved back to active discussion	2026-05-04 04:30:46.228
cmoqphwvt000xv9luda5dk4z4	cmoqfzxgo000nv9pooql1o8sm	Request put on hold	Reyaas	Not able to provide the requirement	2026-05-04 04:35:32.921
cmoqplmsq000zv9luvuao87x6	cmoqmbh3n0009v9w4f9es823d	Request rejected	Reyaas	Not registered	2026-05-04 04:38:26.474
cmoqq2mse0013v9lugszsk0er	cmoqq2mrg0011v9luo91l1py5	Request received	Reyaas	New internal request for: Medical	2026-05-04 04:51:39.614
cmoqq2s2k0015v9luqx2xrvld	cmoqq2mrg0011v9luo91l1py5	Beneficiary verified	Reyaas	Family card verification completed successfully	2026-05-04 04:51:46.461
cmoqq53fz0019v9luccuhgh02	cmoqq2mrg0011v9luo91l1py5	Investigation added	Reyaas	Field visit by: Mohammed Jabbar, Bicasi	2026-05-04 04:53:34.511
cmoqq5p7q001dv9lue7rh491v	cmoqq2mrg0011v9luo91l1py5	Investigation added	Reyaas	Field visit by: Fathima Jabbar, Bicasi	2026-05-04 04:54:02.726
cmore2bxs000bv9rsva5fzbcj	cmoqq2mrg0011v9luo91l1py5	Request put on hold	Reyaas	Testing on hold	2026-05-04 16:03:16.336
cmore8q7j0001v9ae8nfu04r8	cmoqq2mrg0011v9luo91l1py5	Review resumed	Reyaas	Request moved back to active discussion	2026-05-04 16:08:14.768
cmore98pm0005v9ae6po1rkre	cmoqq2mrg0011v9luo91l1py5	Investigation added	Reyaas	Field visit by: Mohammed Jabbar, Bicasi	2026-05-04 16:08:38.747
cmoreas6y0009v9ae8t643oop	cmoqq2mrg0011v9luo91l1py5	Investigation added	Reyaas	Field visit by: Mohammed Jabbar, Bicasi	2026-05-04 16:09:50.651
cmorecwum000bv9aem6cg2i50	cmoqq2mrg0011v9luo91l1py5	Request approved	Reyaas	Granted: 100000. Passed Rs Hundred thousands only after committee discussion.	2026-05-04 16:11:29.998
cmoreda0k000dv9aetp2efo58	cmoqq2mrg0011v9luo91l1py5	Funds disbursed	Reyaas	Method: CHEQUE. 	2026-05-04 16:11:47.06
cmorwyouk000fv9aequl66pi9	cmoqmbh3n0009v9w4f9es823d	Review resumed	Reyaas	reopen based on request	2026-05-05 00:52:19.148
cmos2pyk1000jv98xfh6y4mpq	cmos2pyju000hv98x82neo6ef	Request received	Reyaas	New internal request for: Living Support	2026-05-05 03:33:29.522
cmos2q1gy000lv98xifm9jq0g	cmos2pyju000hv98x82neo6ef	Beneficiary verified	Reyaas	Family card verification completed successfully	2026-05-05 03:33:33.298
cmos3ul55000nv98xzmyctu2i	cmoqmbh3n0009v9w4f9es823d	Beneficiary verified	Reyaas	Family card verification completed successfully	2026-05-05 04:05:05.033
cmos3xchy0001v9i0uotwondt	cmoqmbh3n0009v9w4f9es823d	Request approved	Reyaas	Granted: 100000. decided to pay Rs 100,000	2026-05-05 04:07:13.798
cmos3y5l40005v9i0thiic9wh	cmoqmbh3n0009v9w4f9es823d	Funds disbursed	Reyaas	Method: CASH. 	2026-05-05 04:07:51.496
cmos3zkff0007v9i072kgldry	cmos2pyju000hv98x82neo6ef	Request approved	Reyaas	Granted: 6000 per month for 7 months (2026-06 to 2026-12). Decision has taken to pay Rs 6,000 for 7 months till Dec2026	2026-05-05 04:08:57.387
cmos40gl4000bv9i0099vjqf8	cmos2pyju000hv98x82neo6ef	Funds disbursed	Reyaas	Method: CHEQUE. 	2026-05-05 04:09:39.065
cmos4tfyw000fv9i0j9x72om6	cmos4tfya000dv9i0puz7n48r	Request received	Reyaas	New internal request for: Housing	2026-05-05 04:32:11.288
cmos4tjqy000hv9i08v8tam5y	cmos4tfya000dv9i0puz7n48r	Beneficiary verified	Reyaas	Family card verification completed successfully	2026-05-05 04:32:16.186
cmos4u54b000jv9i0vnbfba0z	cmos4tfya000dv9i0puz7n48r	Request rejected	Reyaas	Not able to provide land requirement.	2026-05-05 04:32:43.883
cmos4w1xx000nv9i0kggu5yz4	cmos4w1uz000lv9i06ynfa5l5	Request received	Reyaas	New internal request for: Self Employment	2026-05-05 04:34:13.077
cmos4wxwh000rv9i0o6kcymlr	cmos4w1uz000lv9i06ynfa5l5	Investigation added	Reyaas	Field visit by: Mohammed Jabbar, Bicasi	2026-05-05 04:34:54.498
cmos4yqv4000vv9i0yf4csf1f	cmos4w1uz000lv9i06ynfa5l5	Appointment scheduled	Reyaas	Inquiry at: Office on 2026-05-05	2026-05-05 04:36:18.688
cmos4zhx7000xv9i0cgkllfbp	cmos4w1uz000lv9i06ynfa5l5	Appointment completed	Reyaas	Enquire did and explained his new business which he has experience.	2026-05-05 04:36:53.755
cmos50fda000zv9i0nz4iylo2	cmos4w1uz000lv9i06ynfa5l5	Request approved	Reyaas	Granted: 300000. After having discussion with the person, committee decided to pay Rs 300,000.	2026-05-05 04:37:37.102
cmos50p3g0013v9i0km4k70oq	cmos4w1uz000lv9i06ynfa5l5	Funds disbursed	Reyaas	Method: CASH. 	2026-05-05 04:37:49.709
cmos51wek0017v9i088lar6l0	cmos51wea0015v9i0ktdxu99l	Request received	Reyaas	New internal request for: Employment	2026-05-05 04:38:45.836
cmos5ymzn001bv9i052o3smiy	cmos2pyju000hv98x82neo6ef	Funds disbursed	Reyaas	Method: CASH. 	2026-05-05 05:04:13.284
cmos5zoet001fv9i01sixcbvq	cmos2pyju000hv98x82neo6ef	Funds disbursed	Reyaas	Method: CASH. 	2026-05-05 05:05:01.781
cmos65b5t001jv9i0z21u2ly1	cmos2pyju000hv98x82neo6ef	Funds disbursed	Reyaas	Method: CASH. 	2026-05-05 05:09:24.545
cmote6yhv0005v988a9q7p4ga	cmos51wea0015v9i0ktdxu99l	Beneficiary verified	Reyaas	Family card verification completed successfully	2026-05-06 01:42:24.547
\.


--
-- Data for Name: Investigation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Investigation" (id, "fundRequestId", investigators, "visitDate", findings, "createdAt", "actualVisitDate", "attendedMembers", attachments) FROM stdin;
cmopz8pss0007v9powmw9prpn	cmopz6kfu0001v9por8684158	TEsti	2026-05-03 00:00:00	dffsf	2026-05-03 16:20:33.817	\N	\N	{}
cmopz99x1000bv9popl4mg6y8	cmopz6kfu0001v9por8684158	jjsdfs f, ksdfkdsjfds, dskfdskfkjalfaf	2026-05-03 00:00:00	sddsfaf	2026-05-03 16:20:59.894	\N	\N	{}
cmoreas6r0007v9ae6lsx5igj	cmoqq2mrg0011v9luo91l1py5	Mohammed Jabbar, Bicasi	2026-05-04 00:00:00	Done investigating, explained their needs	2026-05-04 16:09:50.643	2026-05-04 00:00:00	Mohammed Jabbar, Bicasi	{/uploads/investigations/1777910990576-First-Term-Parent–Teacher-Interaction-(PTI)-(1).jpg,/uploads/investigations/1777911021597-maydayNotice.jpg}
cmos4wxw4000pv9i085ym5x61	cmos4w1uz000lv9i06ynfa5l5	Mohammed Jabbar, Bicasi	2026-05-04 00:00:00	Required investigation;\nDone the investigation, living in a very bad condition with two children	2026-05-05 04:34:54.482	2026-05-05 00:00:00	Mohammed Jabbar, Bicasi	{/uploads/investigations/1777955755822-maydayNotice.jpg,/uploads/investigations/1777955755895-timetablechange.jpg}
cmoqhj5wx0005v9wxsl6yr6al	cmopz6kfu0001v9por8684158	Mohammed Jabbar, Fathima Jabbar, Fathima Bicasi	2026-05-08 00:00:00	Visited and check the house condition.	2026-05-04 00:52:34.35	2026-05-04 00:00:00	Mohammed Jabbar, Bicasi	{/uploads/investigations/1777858164644-First-Term-Parent–Teacher-Interaction-(PTI)-(1).png,/uploads/investigations/1777858164645-maydayNotice.png}
cmoqp1ndg0005v9luuy484m2e	cmoqgeup10001v9wx749lpmv0	Bicasi, Mohammed Jabbar	2026-05-05 00:00:00	Vistited the site and checked	2026-05-04 04:22:54.1	2026-05-04 00:00:00	\N	{/uploads/investigations/1777868573976-First-Term-Parent–Teacher-Interaction-(PTI)-(1).jpg}
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoice" (id, "invoiceNo", amount, status, "dueDate", "paidAt", "licensePlanId", "mainMahallaId", "registrationRequestId", "createdAt", "updatedAt") FROM stdin;
cmothfmbh0007v9czmn7rumg2	INV-187516-9038	8000	UNPAID	2026-05-13 03:13:07.516	\N	cmotfucc40002v9gabxm8bn4q	\N	cmothfmb80005v9cz69z3utwq	2026-05-06 03:13:07.517	2026-05-06 03:13:07.517
cmotj6y0o0004v9qcdmhwiqbd	INV-142003-2825	1000	PAID	2026-05-13 04:02:22.004	2026-05-06 04:14:44.315	cmotfucbk0000v9gasvm6v5by	cmotjo0b00006v9qckbi8fxde	cmotj6y0d0002v9qc93bazfdl	2026-05-06 04:02:22.007	2026-05-06 04:15:38.15
cmotr38lf000hv9vsk6dhq02t	INV-406016-1705	8000	PAID	2026-05-13 07:43:26.018	2026-05-06 08:07:20.5	cmotfucc40002v9gabxm8bn4q	cmott3w84000bv982gjm9ym5l	cmotr38l6000fv9vs5lezsjr2	2026-05-06 07:43:26.019	2026-05-06 08:39:55.887
\.


--
-- Data for Name: LicensePlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LicensePlan" (id, name, type, "basePrice", "salePrice", "isSaleActive", description, features, status, "isDefault", "createdAt", "updatedAt", "featureConfig") FROM stdin;
cmotfucbk0000v9gasvm6v5by	Standard	MONTHLY	1500	1000	t	Essential tools for small mahalla management	{"One Sub Mahalla","All Available Features","Unlimited Families","Free Upgrades"}	ACTIVE	t	2026-05-06 02:28:35.168	2026-05-06 02:46:34.461	{"ALLOW_ANALYTICS": true, "MAX_SUB_MAHALLAS": 1, "ALLOW_DONOR_REGISTRY": true, "ALLOW_FUND_DISTRIBUTION": true, "ALLOW_COMMITTEE_OVERSIGHT": true}
cmotfucc10001v9gaychcsrcp	Pro Basic	MONTHLY	7500	5000	t	Advanced features for growing organizations	{"Five Sub Mahallas","All Available Features","Unlimited Families","Free Upgrades"}	ACTIVE	f	2026-05-06 02:28:35.186	2026-05-06 02:47:12.908	{"ALLOW_ANALYTICS": true, "MAX_SUB_MAHALLAS": 5, "ALLOW_DONOR_REGISTRY": true, "ALLOW_FUND_DISTRIBUTION": true, "ALLOW_COMMITTEE_OVERSIGHT": true}
cmotfucc40002v9gabxm8bn4q	PRO ADVANCE	MONTHLY	10000	8000	t	Full suite for large networks with priority support	{"Ten Sub Mahallas","All Available Features","Unlimited Families","Free Upgrades"}	ACTIVE	f	2026-05-06 02:28:35.188	2026-05-06 02:55:59.146	{"ALLOW_ANALYTICS": true, "MAX_SUB_MAHALLAS": 10, "ALLOW_DONOR_REGISTRY": true, "ALLOW_FUND_DISTRIBUTION": true, "ALLOW_COMMITTEE_OVERSIGHT": true}
cmotgv1ug0001v9czz661682n	PRO ADVANCE yearly	ANNUALLY	120000	96000	t	Full suite for large networks with priority support	{"Ten Sub Mahallas","All Available Features","Unlimited Families","Free Upgrades"}	ACTIVE	f	2026-05-06 02:57:07.858	2026-05-06 02:57:42.964	{"ALLOW_ANALYTICS": true, "MAX_SUB_MAHALLAS": 10, "ALLOW_DONOR_REGISTRY": true, "ALLOW_FUND_DISTRIBUTION": true, "ALLOW_COMMITTEE_OVERSIGHT": true}
\.


--
-- Data for Name: MainMahalla; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MainMahalla" (id, name, logo, "coverImage", "registeredDate", email, address, country, province, district, area, status, "createdAt", "updatedAt", "defaultCurrency", "activatedDate", "deactivatedDate", phone, "licensePlanId") FROM stdin;
cmop75hs00000v9x1e5k34ycn	Colombo Central Mahalla	\N	\N	2026-05-03 03:14:14.208		Colombo, Sri Lanka				\N	INACTIVE	2026-05-03 03:14:14.208	2026-05-03 10:42:47.351	LKR	\N	2026-05-03 10:42:47.349	\N	\N
cmotjo0b00006v9qckbi8fxde	KKK Main Mahalla	/uploads/main-mahallas/1778043030775-KKK.png	\N	2026-05-06 04:15:38.124	zetatutorhub@gmail.com	555500, Ukuwela	Sri Lanka	Central	Matale	Matale	ACTIVE	2026-05-06 04:15:38.124	2026-05-06 04:50:30.784	LKR	\N	\N	98348938943	cmotfucbk0000v9gasvm6v5by
cmosbqk4p0000v92vja0jpt24	MNM Main Mahalla	\N	\N	2026-05-05 07:45:54.025	zetatutoronline@gmail.com	No 68, Ukuwela	Sri Lanka	Central	Matale	Matale	ACTIVE	2026-05-05 07:45:54.025	2026-05-05 08:13:09.521	LKR	\N	\N	0768242424	cmotfucbk0000v9gasvm6v5by
cmop7ehze0001v9rjwpytuz1w	WM Jumma Masjid	/uploads/main-mahallas/1777885339697-wjm.png	/uploads/main-mahallas/1777885339699-wjm.png	2026-05-03 03:21:14.378	reyaas240@gmail.com	No 6054543,Warakamura	Sri Lanka	Central	Matale	Warakamura	ACTIVE	2026-05-03 03:21:14.378	2026-05-04 09:02:19.701	LKR	\N	\N	+96892800119	cmotfucc10001v9gaychcsrcp
cmotsm19z0000v9wqw22k7hx1	Test Mahalla 1778055961756	\N	\N	2026-05-06 08:26:02.615	\N	\N	\N	\N	\N	\N	ACTIVE	2026-05-06 08:26:02.615	2026-05-06 08:26:02.615	LKR	\N	\N	\N	\N
cmott3w84000bv982gjm9ym5l	WJM Jumma Masjid	/uploads/main-mahallas/1778058585151-wjm.png	/uploads/main-mahallas/1778058585156-wjm.png	2026-05-06 08:39:55.875	reyaas240@gmail.com	849332,Warakamura	Sri Lanka	Central	Matale	\N	ACTIVE	2026-05-06 08:39:55.875	2026-05-06 09:09:45.16	LKR	\N	\N	9893432432	cmotfucc40002v9gabxm8bn4q
\.


--
-- Data for Name: MasterArea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterArea" (id, name, "districtId") FROM stdin;
cmop7fuk7000av9rj8w2ibugj	Warakamura	cmop7ficb0008v9rjfrvkfoed
cmoqs7zo90001v9smqkew1d4u	Mattawa	cmop7ficb0008v9rjfrvkfoed
cmoqs850q0003v9smnd0o38cy	Warakanda	cmop7ficb0008v9rjfrvkfoed
cmoqs8b690005v9sm8ml34cd1	Huda	cmop7ficb0008v9rjfrvkfoed
cmoqs8gfw0007v9smpf4mr8jg	Meedeniya	cmop7ficb0008v9rjfrvkfoed
cmoqs8o0y0009v9smix12rloz	Hijra	cmop7ficb0008v9rjfrvkfoed
cmoqs9jg9000bv9sm7gh8yang	Porcelain Watta	cmop7ficb0008v9rjfrvkfoed
cmoqsa926000dv9smjw105lw4	Samoon Mawatha Junction	cmop7ficb0008v9rjfrvkfoed
cmoqsap7b000fv9smkd843y2d	Ukuwelawatta	cmop7ficb0008v9rjfrvkfoed
cmoscpdm60001v9217581imzr	Matale	cmop7ficb0008v9rjfrvkfoed
\.


--
-- Data for Name: MasterCountry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterCountry" (id, name, code, currency, "currencyDecimalPlaces") FROM stdin;
cmop7f3f30004v9rjw4eimfwj	Sri Lanka	LK	RS	2
\.


--
-- Data for Name: MasterDistrict; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterDistrict" (id, name, "provinceId") FROM stdin;
cmop7ficb0008v9rjfrvkfoed	Matale	cmop7fbig0006v9rjzbdnqm27
\.


--
-- Data for Name: MasterGrade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterGrade" (id, name) FROM stdin;
cmorxw2qr000iv9aeydt9fgok	KG-Grade10
cmorxwasp000jv9aeb1gyy39o	G.C.E (O/L)
cmorxwl6q000kv9ae93ra8ago	G.C.E (A/L)
cmorxwpmu000lv9aetyrkefop	University
\.


--
-- Data for Name: MasterOccupation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterOccupation" (id, name) FROM stdin;
cmope8hyz000zv9rj1nhes9jm	Engineer
cmope8mx10010v9rj5gpsnb9s	Software Engineer
cmope8rjj0011v9rjcbugj8wz	Accountant
cmope8ug60012v9rjymmk1irv	Teacher
cmope8xq00013v9rj9tz02vm1	Principal
cmope9em50014v9rjdkty39w8	Sales Person
cmope9it60015v9rjgsgdjqes	Welder
cmope9nbn0016v9rjk7fu93a5	Mason
cmope7spa000xv9rjfrwct168	Businessman
cmoqsb69h000gv9smaa46sr2e	Housewife
cmoqsbtuu000hv9smv8zacz4v	Wadu Bass
cmoqsby5z000iv9smv978wd09	painter
cmoqsc7fm000jv9smlsa8xxky	mechanic
cmoqsccib000kv9smwqb6n857	Electrician
cmoqscwf7000lv9sm0un2q7lm	Daily Worker
cmoqsd3bs000mv9smko3hgsg6	Cleaner
\.


--
-- Data for Name: MasterProvince; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterProvince" (id, name, "countryId") FROM stdin;
cmop7fbig0006v9rjzbdnqm27	Central	cmop7f3f30004v9rjw4eimfwj
\.


--
-- Data for Name: MasterSchool; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterSchool" (id, name) FROM stdin;
cmorxz9tg000mv9aeu06j66u3	MT/W An-Noor Muslim Maha Vidyalaya
cmorxzm2a000nv9aeda3cys5o	MT/M Zahira College
cmory0412000ov9ae4br1f7s7	Peradeniya University
cmory0bc6000pv9aeubwzdls8	Colombo University
\.


--
-- Data for Name: OpeningBalanceCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OpeningBalanceCategory" (id, name, "mainMahallaId", "createdAt") FROM stdin;
cmopnjram0001v9keihcc8f2r	Peoples bank account	cmop7ehze0001v9rjwpytuz1w	2026-05-03 10:53:13.572
cmopnvejq0003v9lxf66qbazb	Petty Cash	cmop7ehze0001v9rjwpytuz1w	2026-05-03 11:02:16.931
\.


--
-- Data for Name: OtpVerification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OtpVerification" (id, email, otp, "expiresAt", "createdAt") FROM stdin;
cmos8vnxg0000v9lsq12x0lxn	reyaas@techbsl.com	187117	2026-05-05 06:35:53.257	2026-05-05 06:25:53.379
\.


--
-- Data for Name: ProjectMaster; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectMaster" (id, name, description, "committeeId", "createdAt") FROM stdin;
cmos0hg6o000hv9jgs5dfm9yg	2026 Fund Distribution	\N	cmopesdnl001sv9rj43597w7h	2026-05-05 02:30:53.23
\.


--
-- Data for Name: RegistrationRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RegistrationRequest" (id, "fullName", email, phone, "mahallaName", "selfieUrl", "governmentIdUrl", status, "createdAt", "updatedAt", address, country, district, province, "isVerified", "licensePlanId") FROM stdin;
cmotj6y0d0002v9qc93bazfdl	KKK	zetatutorhub@gmail.com	98348938943	KKK Main Mahalla	/uploads/registrations/selfies/1778040141949-timetablechange.jpg	/uploads/registrations/ids/1778040141827-maydayNotice.jpg	APPROVED	2026-05-06 04:02:21.996	2026-05-06 04:15:38.576	555500, Ukuwela	Sri Lanka	Matale	Central	t	cmotfucbk0000v9gasvm6v5by
cmosb9usm0001v9bhwy7naiul	Rey	zetatutoronline@gmail.com	0768242424	MNM Main Mahalla	/uploads/registrations/selfies/1777966374666-timetablechange.jpg	/uploads/registrations/ids/1777966374601-maydayNotice.jpg	APPROVED	2026-05-05 07:32:54.694	2026-05-05 07:45:55.389	No 68, Ukuwela	Sri Lanka	Matale	Central	t	cmotfucbk0000v9gasvm6v5by
cmop7b8so0000v9rjfda9qw4m	Reyaas	reyaas240olf@gmail.com	+96892800119	WM Jumma Masjid	\N	\N	APPROVED	2026-05-03 03:18:42.422	2026-05-03 03:21:14.368	NO 606060, Warakamura	Sri Lanka	Matale	Central	t	cmotfucc10001v9gaychcsrcp
cmotr38l6000fv9vs5lezsjr2	wmadmin	reyaas240@gmail.com	9893432432	WJM Jumma Masjid	/uploads/registrations/selfies/1778053405972-timetablechange.jpg	/uploads/registrations/ids/1778053405850-maydayNotice.jpg	APPROVED	2026-05-06 07:43:26.01	2026-05-06 08:39:57.234	849332,Warakamura	Sri Lanka	Matale	Central	t	cmotfucc40002v9gabxm8bn4q
\.


--
-- Data for Name: RequestCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RequestCategory" (id, name, "committeeId", "createdAt") FROM stdin;
cmorzrngx0001v9jg3tmywj3m	Medical	cmopesdnl001sv9rj43597w7h	2026-05-05 02:10:49.615
cmorzrwiv0003v9jge8yl8lno	Living Support	cmopesdnl001sv9rj43597w7h	2026-05-05 02:11:01.351
cmorzrzq10005v9jgoseee26u	Housing	cmopesdnl001sv9rj43597w7h	2026-05-05 02:11:05.497
cmorzs5wo0007v9jg9kxo911z	Self Employment	cmopesdnl001sv9rj43597w7h	2026-05-05 02:11:13.512
cmorzsm2l0009v9jgx8wud490	Employment	cmopesdnl001sv9rj43597w7h	2026-05-05 02:11:34.459
\.


--
-- Data for Name: SubMahalla; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SubMahalla" (id, name, logo, "coverImage", "registeredDate", email, address, area, "mainMahallaId", status, "createdAt", "updatedAt") FROM stdin;
cmop7zvjd0002v98ufdistw46	Slave Island North	\N	\N	2026-05-03 03:37:51.722	\N	\N	\N	cmop75hs00000v9x1e5k34ycn	ACTIVE	2026-05-03 03:37:51.722	2026-05-03 03:37:51.722
cmop7zvjl0004v98uyop108g5	Kollupitiya East	\N	\N	2026-05-03 03:37:51.73	\N	\N	\N	cmop75hs00000v9x1e5k34ycn	ACTIVE	2026-05-03 03:37:51.73	2026-05-03 03:37:51.73
cmostt0v2000bv921p080uzp4	MNM Sub mahalla 1	\N	\N	2026-05-05 16:11:42.107	mnmsub1@mail.com		Matale	cmosbqk4p0000v92vja0jpt24	ACTIVE	2026-05-05 16:11:42.107	2026-05-05 16:11:42.107
cmotk04br0001v9vsa3lsqm4h	KKK Sub Mahalla 1	/uploads/sub-mahallas/1778043056323-KKK.png	\N	2026-05-06 04:25:03.205			Matale	cmotjo0b00006v9qckbi8fxde	ACTIVE	2026-05-06 04:25:03.205	2026-05-06 04:50:56.326
cmoqxaltp000qv9sm7ry42ppm	Seeni Appa Thaikiya	/uploads/sub-mahallas/1777883902682-seeniappa.png	/uploads/sub-mahallas/1777884162873-seeniappa.png	2026-05-04 08:13:48.924			Samoon Mawatha Junction	cmott3w84000bv982gjm9ym5l	ACTIVE	2026-05-04 08:13:48.924	2026-05-04 08:42:42.875
cmop7gnbg000cv9rj9cafk3ob	WJM Masjid Mahalla	/uploads/sub-mahallas/1777883885788-wjm.png	/uploads/sub-mahallas/1777884144601-wjm.png	2026-05-03 03:22:54.602			Warakamura	cmott3w84000bv982gjm9ym5l	ACTIVE	2026-05-03 03:22:54.602	2026-05-06 09:06:59.999
cmoqxa6pb000ov9smnmad6fan	muhaideen masjid	/uploads/sub-mahallas/1777883894983-muhaideen.png	/uploads/sub-mahallas/1777884155435-muhaideen.png	2026-05-04 08:13:29.326			Mattawa	cmott3w84000bv982gjm9ym5l	ACTIVE	2026-05-04 08:13:29.326	2026-05-06 09:07:48.242
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscription" (id, "mainMahallaId", "licensePlanId", status, "startDate", "nextInvoiceDate", "lastInvoicedAt", "createdAt", "updatedAt") FROM stdin;
cmotjo0c40008v9qck2etbgyq	cmotjo0b00006v9qckbi8fxde	cmotfucbk0000v9gasvm6v5by	ACTIVE	2026-05-06 04:15:38.164	2026-06-06 04:15:38.16	\N	2026-05-06 04:15:38.164	2026-05-06 04:15:38.164
cmott3w8o000dv982rrdc82x2	cmott3w84000bv982gjm9ym5l	cmotfucc40002v9gabxm8bn4q	ACTIVE	2026-05-06 08:39:55.897	2026-06-06 08:39:55.895	\N	2026-05-06 08:39:55.897	2026-05-06 08:39:55.897
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSettings" (id, "smtpHost", "smtpPort", "smtpUser", "smtpPassword", "smtpFromEmail", "smtpFromName", "smtpEncryption", "updatedAt", "recaptchaSecretKey", "recaptchaSiteKey", "accountHolder", "accountNumber", "bankInstructions", "bankName", "logoUrl") FROM stdin;
global	mail.crestfield.edu.lk	587	hr@crestfield.edu.lk	Wire2010!*	hr@crestfield.edu.lk	\N	TLS	2026-05-06 04:13:41.105	6LfrF9osAAAAAL2ZJLSyWspc2m4Ldbv_J06sTzDx	6LfrF9osAAAAAHSo3mYN8AeJCNRYP44hUsvLaqlW	Mahallas Plus Pvt Ltd	19999988938924	Please mention your invoice number for the reference.	Commercial Bank	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image, password, role, "mainMahallaId", "subMahallaId", "createdAt", "updatedAt", "committeeId") FROM stdin;
cmosbqk510002v92voqdod3c0	Rey	zetatutoronline@gmail.com	\N	\N	$2b$10$T4KwwiCyHGI9.FujRZtIK.9mreKNl6aL4RK5.l2Ad2eTm00h0XefG	MAIN_ADMIN	cmosbqk4p0000v92vja0jpt24	\N	2026-05-05 07:45:54.037	2026-05-05 16:10:46.434	\N
cmotjo0cl000av9qcj6boldbc	KKK	zetatutorhub@gmail.com	\N	\N	$2b$10$.xlBOaRLwU/7P6QZpI9.6.dNA1xukBGRVz8d.CLpjTrv3N0E3hDBm	MAIN_ADMIN	cmotjo0b00006v9qckbi8fxde	\N	2026-05-06 04:15:38.18	2026-05-06 04:15:38.18	\N
cmott3w8w000fv982lq6d872r	wmadmin	reyaas240@gmail.com	\N	\N	$2b$10$RNDaUJoxih3dFRwD7laSze/Na1H9Limoe7WOL7QTvNcWGJrZzqDj.	MAIN_ADMIN	cmott3w84000bv982gjm9ym5l	\N	2026-05-06 08:39:55.904	2026-05-06 08:41:07.154	\N
cmop7j0y0000ev9rj25s4zr8k	WJ Sub Admin	wjsa@mail.com	\N	\N	$2b$10$FnSnY8Rp87QQF4nlb6/eo.0Z4pe0F0.OtyF/7596DgZxqKYAeRy/C	SUB_ADMIN	cmott3w84000bv982gjm9ym5l	cmop7gnbg000cv9rj9cafk3ob	2026-05-03 03:24:45.575	2026-05-03 03:24:45.575	\N
cmoqxs62r000sv9sm7lpxhnmp	Muhaideen	muhaideen@mail.com	\N	\N	$2b$10$UTL27479l30l6R7O0GSYZO4YKOm2elC.x1ziqN3ic0nqj2ofOFpO6	SUB_ADMIN	cmott3w84000bv982gjm9ym5l	cmoqxa6pb000ov9smnmad6fan	2026-05-04 08:27:28.322	2026-05-04 08:27:28.322	\N
cmop7ei2o0003v9rje3menhyy	Reyaas	reyaas240old@gmail.com	\N	\N	$2b$10$.xlBOaRLwU/7P6QZpI9.6.dNA1xukBGRVz8d.CLpjTrv3N0E3hDBm	MAIN_ADMIN	cmott3w84000bv982gjm9ym5l	\N	2026-05-03 03:21:14.496	2026-05-05 15:51:19.564	\N
cmop75hs80002v9x1vjqe62uk	Platform Admin	admin@mahallasplus.com	\N	\N	$2b$10$TWztMZimnbHbN4o9sQ9yeeZLRyp3VIEtfQB0x7TFK5Ggwz3qr4RBy	PLATFORM_ADMIN	cmop75hs00000v9x1e5k34ycn	\N	2026-05-03 03:14:14.217	2026-05-07 02:08:34.943	\N
\.


--
-- Name: CommitteeMember CommitteeMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeMember"
    ADD CONSTRAINT "CommitteeMember_pkey" PRIMARY KEY (id);


--
-- Name: CommitteeTermBalance CommitteeTermBalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeTermBalance"
    ADD CONSTRAINT "CommitteeTermBalance_pkey" PRIMARY KEY (id);


--
-- Name: CommitteeTerm CommitteeTerm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeTerm"
    ADD CONSTRAINT "CommitteeTerm_pkey" PRIMARY KEY (id);


--
-- Name: Committee Committee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Committee"
    ADD CONSTRAINT "Committee_pkey" PRIMARY KEY (id);


--
-- Name: Donation Donation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_pkey" PRIMARY KEY (id);


--
-- Name: DonorContact DonorContact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DonorContact"
    ADD CONSTRAINT "DonorContact_pkey" PRIMARY KEY (id);


--
-- Name: Donor Donor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donor"
    ADD CONSTRAINT "Donor_pkey" PRIMARY KEY (id);


--
-- Name: FamilyCard FamilyCard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyCard"
    ADD CONSTRAINT "FamilyCard_pkey" PRIMARY KEY (id);


--
-- Name: FamilyMember FamilyMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyMember"
    ADD CONSTRAINT "FamilyMember_pkey" PRIMARY KEY (id);


--
-- Name: FundAppointment FundAppointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundAppointment"
    ADD CONSTRAINT "FundAppointment_pkey" PRIMARY KEY (id);


--
-- Name: FundDisbursement FundDisbursement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundDisbursement"
    ADD CONSTRAINT "FundDisbursement_pkey" PRIMARY KEY (id);


--
-- Name: FundQuotation FundQuotation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundQuotation"
    ADD CONSTRAINT "FundQuotation_pkey" PRIMARY KEY (id);


--
-- Name: FundRequestEvent FundRequestEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundRequestEvent"
    ADD CONSTRAINT "FundRequestEvent_pkey" PRIMARY KEY (id);


--
-- Name: FundRequest FundRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundRequest"
    ADD CONSTRAINT "FundRequest_pkey" PRIMARY KEY (id);


--
-- Name: Investigation Investigation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investigation"
    ADD CONSTRAINT "Investigation_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: LicensePlan LicensePlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LicensePlan"
    ADD CONSTRAINT "LicensePlan_pkey" PRIMARY KEY (id);


--
-- Name: MainMahalla MainMahalla_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MainMahalla"
    ADD CONSTRAINT "MainMahalla_pkey" PRIMARY KEY (id);


--
-- Name: MasterArea MasterArea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterArea"
    ADD CONSTRAINT "MasterArea_pkey" PRIMARY KEY (id);


--
-- Name: MasterCountry MasterCountry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterCountry"
    ADD CONSTRAINT "MasterCountry_pkey" PRIMARY KEY (id);


--
-- Name: MasterDistrict MasterDistrict_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterDistrict"
    ADD CONSTRAINT "MasterDistrict_pkey" PRIMARY KEY (id);


--
-- Name: MasterGrade MasterGrade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterGrade"
    ADD CONSTRAINT "MasterGrade_pkey" PRIMARY KEY (id);


--
-- Name: MasterOccupation MasterOccupation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterOccupation"
    ADD CONSTRAINT "MasterOccupation_pkey" PRIMARY KEY (id);


--
-- Name: MasterProvince MasterProvince_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterProvince"
    ADD CONSTRAINT "MasterProvince_pkey" PRIMARY KEY (id);


--
-- Name: MasterSchool MasterSchool_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterSchool"
    ADD CONSTRAINT "MasterSchool_pkey" PRIMARY KEY (id);


--
-- Name: OpeningBalanceCategory OpeningBalanceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OpeningBalanceCategory"
    ADD CONSTRAINT "OpeningBalanceCategory_pkey" PRIMARY KEY (id);


--
-- Name: OtpVerification OtpVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpVerification"
    ADD CONSTRAINT "OtpVerification_pkey" PRIMARY KEY (id);


--
-- Name: ProjectMaster ProjectMaster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectMaster"
    ADD CONSTRAINT "ProjectMaster_pkey" PRIMARY KEY (id);


--
-- Name: RegistrationRequest RegistrationRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RegistrationRequest"
    ADD CONSTRAINT "RegistrationRequest_pkey" PRIMARY KEY (id);


--
-- Name: RequestCategory RequestCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestCategory"
    ADD CONSTRAINT "RequestCategory_pkey" PRIMARY KEY (id);


--
-- Name: SubMahalla SubMahalla_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubMahalla"
    ADD CONSTRAINT "SubMahalla_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: CommitteeMember_committeeTermId_familyMemberId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CommitteeMember_committeeTermId_familyMemberId_key" ON public."CommitteeMember" USING btree ("committeeTermId", "familyMemberId");


--
-- Name: CommitteeTermBalance_committeeTermId_categoryId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CommitteeTermBalance_committeeTermId_categoryId_key" ON public."CommitteeTermBalance" USING btree ("committeeTermId", "categoryId");


--
-- Name: Donation_committeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Donation_committeeId_idx" ON public."Donation" USING btree ("committeeId");


--
-- Name: Donation_committeeTermId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Donation_committeeTermId_idx" ON public."Donation" USING btree ("committeeTermId");


--
-- Name: Donation_donorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Donation_donorId_idx" ON public."Donation" USING btree ("donorId");


--
-- Name: Donor_mainMahallaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Donor_mainMahallaId_idx" ON public."Donor" USING btree ("mainMahallaId");


--
-- Name: Donor_subMahallaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Donor_subMahallaId_idx" ON public."Donor" USING btree ("subMahallaId");


--
-- Name: FamilyMember_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FamilyMember_email_key" ON public."FamilyMember" USING btree (email);


--
-- Name: FamilyMember_nic_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FamilyMember_nic_key" ON public."FamilyMember" USING btree (nic);


--
-- Name: FundDisbursement_fundRequestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FundDisbursement_fundRequestId_idx" ON public."FundDisbursement" USING btree ("fundRequestId");


--
-- Name: FundRequest_committeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FundRequest_committeeId_idx" ON public."FundRequest" USING btree ("committeeId");


--
-- Name: FundRequest_committeeTermId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FundRequest_committeeTermId_idx" ON public."FundRequest" USING btree ("committeeTermId");


--
-- Name: Invoice_invoiceNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON public."Invoice" USING btree ("invoiceNo");


--
-- Name: LicensePlan_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LicensePlan_name_key" ON public."LicensePlan" USING btree (name);


--
-- Name: MainMahalla_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MainMahalla_name_key" ON public."MainMahalla" USING btree (name);


--
-- Name: MasterArea_name_districtId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterArea_name_districtId_key" ON public."MasterArea" USING btree (name, "districtId");


--
-- Name: MasterCountry_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterCountry_name_key" ON public."MasterCountry" USING btree (name);


--
-- Name: MasterDistrict_name_provinceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterDistrict_name_provinceId_key" ON public."MasterDistrict" USING btree (name, "provinceId");


--
-- Name: MasterGrade_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterGrade_name_key" ON public."MasterGrade" USING btree (name);


--
-- Name: MasterOccupation_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterOccupation_name_key" ON public."MasterOccupation" USING btree (name);


--
-- Name: MasterProvince_name_countryId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterProvince_name_countryId_key" ON public."MasterProvince" USING btree (name, "countryId");


--
-- Name: MasterSchool_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MasterSchool_name_key" ON public."MasterSchool" USING btree (name);


--
-- Name: OpeningBalanceCategory_mainMahallaId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OpeningBalanceCategory_mainMahallaId_name_key" ON public."OpeningBalanceCategory" USING btree ("mainMahallaId", name);


--
-- Name: OtpVerification_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OtpVerification_email_key" ON public."OtpVerification" USING btree (email);


--
-- Name: ProjectMaster_committeeId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProjectMaster_committeeId_name_key" ON public."ProjectMaster" USING btree ("committeeId", name);


--
-- Name: RegistrationRequest_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RegistrationRequest_email_key" ON public."RegistrationRequest" USING btree (email);


--
-- Name: RequestCategory_committeeId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RequestCategory_committeeId_name_key" ON public."RequestCategory" USING btree ("committeeId", name);


--
-- Name: SubMahalla_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SubMahalla_name_key" ON public."SubMahalla" USING btree (name);


--
-- Name: Subscription_mainMahallaId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscription_mainMahallaId_key" ON public."Subscription" USING btree ("mainMahallaId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: CommitteeMember CommitteeMember_committeeTermId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeMember"
    ADD CONSTRAINT "CommitteeMember_committeeTermId_fkey" FOREIGN KEY ("committeeTermId") REFERENCES public."CommitteeTerm"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommitteeMember CommitteeMember_familyMemberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeMember"
    ADD CONSTRAINT "CommitteeMember_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES public."FamilyMember"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommitteeTermBalance CommitteeTermBalance_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeTermBalance"
    ADD CONSTRAINT "CommitteeTermBalance_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."OpeningBalanceCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommitteeTermBalance CommitteeTermBalance_committeeTermId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeTermBalance"
    ADD CONSTRAINT "CommitteeTermBalance_committeeTermId_fkey" FOREIGN KEY ("committeeTermId") REFERENCES public."CommitteeTerm"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommitteeTerm CommitteeTerm_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommitteeTerm"
    ADD CONSTRAINT "CommitteeTerm_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public."Committee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Committee Committee_mainMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Committee"
    ADD CONSTRAINT "Committee_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES public."MainMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Committee Committee_subMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Committee"
    ADD CONSTRAINT "Committee_subMahallaId_fkey" FOREIGN KEY ("subMahallaId") REFERENCES public."SubMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donation Donation_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public."Committee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donation Donation_committeeTermId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_committeeTermId_fkey" FOREIGN KEY ("committeeTermId") REFERENCES public."CommitteeTerm"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donation Donation_donorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES public."Donor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donation Donation_mainMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donation"
    ADD CONSTRAINT "Donation_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES public."MainMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DonorContact DonorContact_donorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DonorContact"
    ADD CONSTRAINT "DonorContact_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES public."Donor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donor Donor_familyMemberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donor"
    ADD CONSTRAINT "Donor_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES public."FamilyMember"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Donor Donor_mainMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donor"
    ADD CONSTRAINT "Donor_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES public."MainMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Donor Donor_subMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Donor"
    ADD CONSTRAINT "Donor_subMahallaId_fkey" FOREIGN KEY ("subMahallaId") REFERENCES public."SubMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FamilyCard FamilyCard_subMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyCard"
    ADD CONSTRAINT "FamilyCard_subMahallaId_fkey" FOREIGN KEY ("subMahallaId") REFERENCES public."SubMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FamilyMember FamilyMember_familyCardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FamilyMember"
    ADD CONSTRAINT "FamilyMember_familyCardId_fkey" FOREIGN KEY ("familyCardId") REFERENCES public."FamilyCard"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundAppointment FundAppointment_fundRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundAppointment"
    ADD CONSTRAINT "FundAppointment_fundRequestId_fkey" FOREIGN KEY ("fundRequestId") REFERENCES public."FundRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundDisbursement FundDisbursement_fundRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundDisbursement"
    ADD CONSTRAINT "FundDisbursement_fundRequestId_fkey" FOREIGN KEY ("fundRequestId") REFERENCES public."FundRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundQuotation FundQuotation_fundRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundQuotation"
    ADD CONSTRAINT "FundQuotation_fundRequestId_fkey" FOREIGN KEY ("fundRequestId") REFERENCES public."FundRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundRequestEvent FundRequestEvent_fundRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundRequestEvent"
    ADD CONSTRAINT "FundRequestEvent_fundRequestId_fkey" FOREIGN KEY ("fundRequestId") REFERENCES public."FundRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundRequest FundRequest_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundRequest"
    ADD CONSTRAINT "FundRequest_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public."Committee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundRequest FundRequest_committeeTermId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundRequest"
    ADD CONSTRAINT "FundRequest_committeeTermId_fkey" FOREIGN KEY ("committeeTermId") REFERENCES public."CommitteeTerm"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FundRequest FundRequest_familyMemberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FundRequest"
    ADD CONSTRAINT "FundRequest_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES public."FamilyMember"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Investigation Investigation_fundRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investigation"
    ADD CONSTRAINT "Investigation_fundRequestId_fkey" FOREIGN KEY ("fundRequestId") REFERENCES public."FundRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_licensePlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_licensePlanId_fkey" FOREIGN KEY ("licensePlanId") REFERENCES public."LicensePlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MainMahalla MainMahalla_licensePlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MainMahalla"
    ADD CONSTRAINT "MainMahalla_licensePlanId_fkey" FOREIGN KEY ("licensePlanId") REFERENCES public."LicensePlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MasterArea MasterArea_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterArea"
    ADD CONSTRAINT "MasterArea_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."MasterDistrict"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasterDistrict MasterDistrict_provinceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterDistrict"
    ADD CONSTRAINT "MasterDistrict_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES public."MasterProvince"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasterProvince MasterProvince_countryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterProvince"
    ADD CONSTRAINT "MasterProvince_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public."MasterCountry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OpeningBalanceCategory OpeningBalanceCategory_mainMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OpeningBalanceCategory"
    ADD CONSTRAINT "OpeningBalanceCategory_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES public."MainMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMaster ProjectMaster_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectMaster"
    ADD CONSTRAINT "ProjectMaster_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public."Committee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RegistrationRequest RegistrationRequest_licensePlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RegistrationRequest"
    ADD CONSTRAINT "RegistrationRequest_licensePlanId_fkey" FOREIGN KEY ("licensePlanId") REFERENCES public."LicensePlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RequestCategory RequestCategory_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RequestCategory"
    ADD CONSTRAINT "RequestCategory_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public."Committee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubMahalla SubMahalla_mainMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubMahalla"
    ADD CONSTRAINT "SubMahalla_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES public."MainMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_mainMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES public."MainMahalla"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public."Committee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_mainMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_mainMahallaId_fkey" FOREIGN KEY ("mainMahallaId") REFERENCES public."MainMahalla"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_subMahallaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_subMahallaId_fkey" FOREIGN KEY ("subMahallaId") REFERENCES public."SubMahalla"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict irn5SfbdqfyxIPYdf4DnxsAotpkpZvXcToAdK5KhDiKeQZfwUWdNRrWoV5S36Xf

