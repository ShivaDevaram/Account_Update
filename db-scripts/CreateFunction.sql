-- Create Function

CREATE OR REPLACE FUNCTION public.notify_profileupdate()
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM pg_notify('profile_update', row_to_json(NEW)::text);
    RETURN NULL;
END;
$function$


-- Create Function

CREATE OR REPLACE FUNCTION public.notify_profileupdate()
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM pg_notify('account_update', row_to_json(NEW)::text);
    RETURN NULL;
END;
$function$


-- Create Trigger

CREATE TRIGGER updated_profile_trigger AFTER INSERT OR UPDATE ON salesforce.user
FOR EACH ROW EXECUTE PROCEDURE notify_profileupdate();

-- Create account Trigger

CREATE TRIGGER updated_account_trigger AFTER INSERT OR UPDATE ON salesforce.account
FOR EACH ROW EXECUTE PROCEDURE notify_profileupdate();


--

create table event_process (
    event_process_id                    bigserial not null,
    last_event_process_date             timestamp with time zone,
    constraint pk_event_process primary key (event_process_id)
);