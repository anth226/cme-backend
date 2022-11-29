--
-- PostgreSQL: wipe villages and related data from a server, but keep the user profiles.
-- CAREFUL: this does not take ingame_mkcs into account, so don't apply this in prod after v1.
--

DELETE from attacks;
DELETE from orders;
DELETE from facilities;
DELETE from villages_resource_types;
DELETE from villages where user_id != 196;
UPDATE users SET new = true;
