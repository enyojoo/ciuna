-- How each bookable service is delivered (moved from expert_profiles.fulfillment_type).
alter table expert_services add column if not exists fulfillment_type text not null default 'online';

comment on column expert_services.fulfillment_type is 'online | in_person | both — delivery mode for this service.';

-- Optional: copy legacy profile-level fulfillment into each service once:
-- update expert_services es
-- set fulfillment_type = coalesce(nullif(trim(ep.fulfillment_type), ''), 'online')
-- from expert_profiles ep
-- where es.expert_profile_id = ep.id;
