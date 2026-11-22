-- Additive permission repair only: no rows, policies, functions or other tables change.
-- Reset inherited default table ACL grants, then retain the three privileges used by the queue RPCs.
begin;
revoke all on public.commercial_requests from service_role;
grant select,insert,update on public.commercial_requests to service_role;
-- Intentionally do not revoke DELETE on commercial_capture_rate_limits: expiry uses it.
commit;
