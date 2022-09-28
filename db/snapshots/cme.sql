--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2 (Debian 13.2-1.pgdg100+1)
-- Dumped by pg_dump version 13.2 (Debian 13.2-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS cme;
--
-- Name: cme; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE cme WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE cme OWNER TO postgres;

\connect cme

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: facilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facilities (
    id integer NOT NULL,
    facility_type_id integer NOT NULL,
    level integer NOT NULL,
    location integer NOT NULL,
    last_production_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    village_id integer NOT NULL
);


ALTER TABLE public.facilities OWNER TO postgres;

--
-- Name: facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.facilities_id_seq OWNER TO postgres;

--
-- Name: facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facilities_id_seq OWNED BY public.facilities.id;


--
-- Name: facility_type_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facility_type_prices (
    id integer NOT NULL,
    facility_type_id integer,
    resource_type_id integer,
    amount integer
);


ALTER TABLE public.facility_type_prices OWNER TO postgres;

--
-- Name: facility_type_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facility_type_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.facility_type_prices_id_seq OWNER TO postgres;

--
-- Name: facility_type_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facility_type_prices_id_seq OWNED BY public.facility_type_prices.id;


--
-- Name: facility_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facility_types (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    industry integer,
    parameters json
);


ALTER TABLE public.facility_types OWNER TO postgres;

--
-- Name: facility_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facility_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.facility_types_id_seq OWNER TO postgres;

--
-- Name: facility_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facility_types_id_seq OWNED BY public.facility_types.id;


--
-- Name: facility_types_resource_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facility_types_resource_types (
    id integer NOT NULL,
    facility_type_id integer NOT NULL,
    resource_type_id integer NOT NULL,
    level integer,
    level_cost integer
);


ALTER TABLE public.facility_types_resource_types OWNER TO postgres;

--
-- Name: facility_types_resource_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facility_types_resource_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.facility_types_resource_types_id_seq OWNER TO postgres;

--
-- Name: facility_types_resource_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facility_types_resource_types_id_seq OWNED BY public.facility_types_resource_types.id;


--
-- Name: industries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.industries (
    id integer NOT NULL,
    name character varying(25) NOT NULL
);


ALTER TABLE public.industries OWNER TO postgres;

--
-- Name: industries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.industries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.industries_id_seq OWNER TO postgres;

--
-- Name: industries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.industries_id_seq OWNED BY public.industries.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    facility_id integer NOT NULL,
    resource_type_id integer NOT NULL,
    ordered_quantity integer NOT NULL,
    delivered_quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: resource_type_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_type_prices (
    id integer NOT NULL,
    target_resource_type_id integer,
    source_resource_type_id integer,
    amount integer
);


ALTER TABLE public.resource_type_prices OWNER TO postgres;

--
-- Name: resource_type_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resource_type_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resource_type_prices_id_seq OWNER TO postgres;

--
-- Name: resource_type_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resource_type_prices_id_seq OWNED BY public.resource_type_prices.id;


--
-- Name: resource_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_types (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    industry integer NOT NULL,
    characteristics json,
    evolution integer,
    blueprint integer
);


ALTER TABLE public.resource_types OWNER TO postgres;

--
-- Name: resource_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resource_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resource_types_id_seq OWNER TO postgres;

--
-- Name: resource_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resource_types_id_seq OWNED BY public.resource_types.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) DEFAULT NULL::character varying,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    eth_wallet_addresses character varying(42),
    role character varying(255) DEFAULT NULL::character varying,
    new boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email_confirmed boolean DEFAULT false,
    email_confirmed_at timestamp with time zone DEFAULT now() NOT NULL,
    last_verification_email_sent timestamp with time zone DEFAULT now() NOT NULL,
    email_verification_token character varying(255) NOT NULL,
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: villages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.villages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    population integer NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    eth_wallet_address character(42),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer
);


ALTER TABLE public.villages OWNER TO postgres;

--
-- Name: villages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.villages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.villages_id_seq OWNER TO postgres;

--
-- Name: villages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.villages_id_seq OWNED BY public.villages.id;


--
-- Name: villages_resource_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.villages_resource_types (
    id integer NOT NULL,
    village_id integer NOT NULL,
    resource_type_id integer NOT NULL,
    count integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.villages_resource_types OWNER TO postgres;

--
-- Name: villages_resource_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.villages_resource_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.villages_resource_types_id_seq OWNER TO postgres;

--
-- Name: villages_resource_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.villages_resource_types_id_seq OWNED BY public.villages_resource_types.id;


--
-- Name: facilities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities ALTER COLUMN id SET DEFAULT nextval('public.facilities_id_seq'::regclass);


--
-- Name: facility_type_prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_type_prices ALTER COLUMN id SET DEFAULT nextval('public.facility_type_prices_id_seq'::regclass);


--
-- Name: facility_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types ALTER COLUMN id SET DEFAULT nextval('public.facility_types_id_seq'::regclass);


--
-- Name: facility_types_resource_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types_resource_types ALTER COLUMN id SET DEFAULT nextval('public.facility_types_resource_types_id_seq'::regclass);


--
-- Name: industries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries ALTER COLUMN id SET DEFAULT nextval('public.industries_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: resource_type_prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_type_prices ALTER COLUMN id SET DEFAULT nextval('public.resource_type_prices_id_seq'::regclass);


--
-- Name: resource_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types ALTER COLUMN id SET DEFAULT nextval('public.resource_types_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: villages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages ALTER COLUMN id SET DEFAULT nextval('public.villages_id_seq'::regclass);


--
-- Name: villages_resource_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages_resource_types ALTER COLUMN id SET DEFAULT nextval('public.villages_resource_types_id_seq'::regclass);


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facilities (id, facility_type_id, level, location, last_production_at, created_at, updated_at, village_id) FROM stdin;
\.


--
-- Data for Name: facility_type_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_type_prices (id, facility_type_id, resource_type_id, amount) FROM stdin;
1	1	2	50
2	1	3	50
3	2	1	50
4	3	1	50
5	3	2	50
6	3	3	50
7	4	1	50
8	4	2	160
9	4	3	100
10	5	1	30
11	5	2	100
12	5	3	150
13	6	1	150
14	6	2	260
15	6	3	80
16	7	1	5
17	7	2	10
18	7	3	20
19	8	1	50
20	8	2	90
21	8	3	200
22	9	1	50
23	9	2	50
24	9	3	50
25	10	1	400
26	10	2	30
27	10	3	40
28	11	1	250
29	11	2	40
30	11	3	170
\.


--
-- Data for Name: facility_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_types (id, type, industry, parameters) FROM stdin;
1	cropland	1	{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }
2	iron_mine	2	{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }
3	sawmill	3	{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }
4	barrack	4	\N
5	shooting_range	4	\N
6	military_center	4	\N
7	wall	5	\N
8	tower	5	\N
9	research_center	6	\N
10	marketplace	7	\N
11	mkc_mine	8	{ "frequency": 3600, "quantity": 10, "increase_rate": 0.1 }
12	main	\N	\N
\.


--
-- Data for Name: facility_types_resource_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facility_types_resource_types (id, facility_type_id, resource_type_id, level, level_cost) FROM stdin;
1	1	1	\N	\N
2	2	2	\N	\N
3	3	3	\N	\N
4	11	4	\N	\N
5	4	5	1	100
6	4	6	2	200
7	4	7	3	300
8	4	8	4	400
9	5	9	1	100
10	5	10	2	200
11	5	11	3	300
12	6	12	1	100
13	6	13	2	200
\.


--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.industries (id, name) FROM stdin;
1	food
2	metal
3	wood
4	military
5	defense
6	research
7	trade
8	cryptocurrency
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1604249012717	init1604249012717
2	1605441756285	Populate1605441756285
3	1617707277896	UserPasswordType1617707277896
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, facility_id, resource_type_id, ordered_quantity, delivered_quantity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: resource_type_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_type_prices (id, target_resource_type_id, source_resource_type_id, amount) FROM stdin;
1	5	1	10
2	5	2	1
3	5	3	10
4	6	1	15
5	6	2	10
6	6	3	5
7	7	1	15
8	7	2	15
9	7	3	10
10	8	1	18
11	8	2	20
12	8	3	10
13	9	1	5
14	9	2	2
15	9	3	10
16	10	1	8
17	10	2	4
18	10	3	15
19	11	1	8
20	11	2	4
21	11	3	15
22	12	1	15
23	12	2	18
24	12	3	10
25	13	1	18
26	13	2	15
27	13	3	25
\.


--
-- Data for Name: resource_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_types (id, type, industry, characteristics, evolution, blueprint) FROM stdin;
1	food	1	\N	\N	\N
2	iron	2	\N	\N	\N
3	wood	3	\N	\N	\N
4	mkc	8	\N	\N	\N
5	clubman	3	{"health":100,"range":1,"damage":8,"defense":4,"pierce_defense":2,"speed":10,"food_upkeep":1,"production_time":10}	\N	\N
6	maceman	3	{"health":120,"range":1,"damage":12,"defense":5,"pierce_defense":2,"speed":10,"food_upkeep":1,"production_time":12}	\N	\N
7	short_sword	3	{"health":140,"range":1,"damage":14,"defense":5,"pierce_defense":4,"speed":10,"food_upkeep":1,"production_time":14}	\N	\N
8	long_sword	3	{"health":150,"range":1,"damage":16,"defense":7,"pierce_defense":6,"speed":10,"food_upkeep":2,"production_time":16}	\N	\N
9	rock_thrower	3	{"health":40,"range":3,"damage":6,"defense":2,"pierce_defense":2,"speed":12,"food_upkeep":1,"production_time":12}	\N	\N
10	slinger	3	{"health":100,"range":1,"damage":8,"defense":4,"pierce_defense":2,"speed":10,"food_upkeep":1,"production_time":10}	\N	\N
11	shortbow	3	{"health":100,"range":1,"damage":8,"defense":4,"pierce_defense":2,"speed":10,"food_upkeep":1,"production_time":10}	\N	\N
12	spearman	3	{"health":100,"range":1,"damage":8,"defense":4,"pierce_defense":2,"speed":10,"food_upkeep":1,"production_time":10}	\N	\N
13	pikeman	3	{"health":100,"range":1,"damage":8,"defense":4,"pierce_defense":2,"speed":10,"food_upkeep":1,"production_time":10}	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, password, eth_wallet_addresses, role, new, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: villages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.villages (id, name, population, x, y, eth_wallet_address, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: villages_resource_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.villages_resource_types (id, village_id, resource_type_id, count, created_at, updated_at) FROM stdin;
\.


--
-- Name: facilities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facilities_id_seq', 1, false);


--
-- Name: facility_type_prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facility_type_prices_id_seq', 30, true);


--
-- Name: facility_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facility_types_id_seq', 12, true);


--
-- Name: facility_types_resource_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facility_types_resource_types_id_seq', 13, true);


--
-- Name: industries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.industries_id_seq', 8, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: resource_type_prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resource_type_prices_id_seq', 27, true);


--
-- Name: resource_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resource_types_id_seq', 13, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: villages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.villages_id_seq', 1, false);


--
-- Name: villages_resource_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.villages_resource_types_id_seq', 1, false);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_village_id_location_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_village_id_location_key UNIQUE (village_id, location);


--
-- Name: facility_type_prices facility_type_prices_facility_type_id_resource_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_type_prices
    ADD CONSTRAINT facility_type_prices_facility_type_id_resource_type_id_key UNIQUE (facility_type_id, resource_type_id);


--
-- Name: facility_type_prices facility_type_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_type_prices
    ADD CONSTRAINT facility_type_prices_pkey PRIMARY KEY (id);


--
-- Name: facility_types facility_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types
    ADD CONSTRAINT facility_types_pkey PRIMARY KEY (id);


--
-- Name: facility_types_resource_types facility_types_resource_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types_resource_types
    ADD CONSTRAINT facility_types_resource_types_pkey PRIMARY KEY (id);


--
-- Name: facility_types facility_types_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types
    ADD CONSTRAINT facility_types_type_key UNIQUE (type);


--
-- Name: industries industries_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_name_key UNIQUE (name);


--
-- Name: industries industries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.industries
    ADD CONSTRAINT industries_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: resource_type_prices resource_type_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_type_prices
    ADD CONSTRAINT resource_type_prices_pkey PRIMARY KEY (id);


--
-- Name: resource_type_prices resource_type_prices_target_resource_type_id_source_resourc_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_type_prices
    ADD CONSTRAINT resource_type_prices_target_resource_type_id_source_resourc_key UNIQUE (target_resource_type_id, source_resource_type_id);


--
-- Name: resource_types resource_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resource_types_pkey PRIMARY KEY (id);


--
-- Name: resource_types resource_types_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resource_types_type_key UNIQUE (type);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: villages villages_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages
    ADD CONSTRAINT villages_name_key UNIQUE (name);


--
-- Name: villages villages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages
    ADD CONSTRAINT villages_pkey PRIMARY KEY (id);


--
-- Name: villages_resource_types villages_resource_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages_resource_types
    ADD CONSTRAINT villages_resource_types_pkey PRIMARY KEY (id);


--
-- Name: villages villages_x_y_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages
    ADD CONSTRAINT villages_x_y_key UNIQUE (x, y);


--
-- Name: facilities facilities_facility_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_facility_type_id_fkey FOREIGN KEY (facility_type_id) REFERENCES public.facility_types(id);


--
-- Name: facilities facilities_village_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id);


--
-- Name: facility_type_prices facility_type_prices_facility_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_type_prices
    ADD CONSTRAINT facility_type_prices_facility_type_id_fkey FOREIGN KEY (facility_type_id) REFERENCES public.facility_types(id);


--
-- Name: facility_type_prices facility_type_prices_resource_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_type_prices
    ADD CONSTRAINT facility_type_prices_resource_type_id_fkey FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id);


--
-- Name: facility_types facility_types_industry_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types
    ADD CONSTRAINT facility_types_industry_fkey FOREIGN KEY (industry) REFERENCES public.industries(id);


--
-- Name: facility_types_resource_types facility_types_resource_types_facility_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types_resource_types
    ADD CONSTRAINT facility_types_resource_types_facility_type_id_fkey FOREIGN KEY (facility_type_id) REFERENCES public.facility_types(id);


--
-- Name: facility_types_resource_types facility_types_resource_types_resource_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facility_types_resource_types
    ADD CONSTRAINT facility_types_resource_types_resource_type_id_fkey FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id);


--
-- Name: orders orders_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(id);


--
-- Name: orders orders_resource_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_resource_type_id_fkey FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id);


--
-- Name: resource_type_prices resource_type_prices_source_resource_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_type_prices
    ADD CONSTRAINT resource_type_prices_source_resource_type_id_fkey FOREIGN KEY (source_resource_type_id) REFERENCES public.resource_types(id);


--
-- Name: resource_type_prices resource_type_prices_target_resource_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_type_prices
    ADD CONSTRAINT resource_type_prices_target_resource_type_id_fkey FOREIGN KEY (target_resource_type_id) REFERENCES public.resource_types(id);


--
-- Name: resource_types resource_types_blueprint_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resource_types_blueprint_fkey FOREIGN KEY (blueprint) REFERENCES public.resource_types(id);


--
-- Name: resource_types resource_types_evolution_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resource_types_evolution_fkey FOREIGN KEY (evolution) REFERENCES public.resource_types(id);


--
-- Name: resource_types resource_types_industry_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resource_types_industry_fkey FOREIGN KEY (industry) REFERENCES public.industries(id);


--
-- Name: villages_resource_types villages_resource_types_resource_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages_resource_types
    ADD CONSTRAINT villages_resource_types_resource_type_id_fkey FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id);


--
-- Name: villages_resource_types villages_resource_types_village_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages_resource_types
    ADD CONSTRAINT villages_resource_types_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id);


--
-- Name: villages villages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.villages
    ADD CONSTRAINT villages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

