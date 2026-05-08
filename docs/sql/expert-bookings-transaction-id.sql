-- Links expert bookings to Ciuna payment transactions (hub-style checkout).
alter table expert_bookings add column if not exists transaction_id text;

comment on column expert_bookings.transaction_id is 'transactions.transaction_id once checkout creates payment';

create index if not exists expert_bookings_transaction_id_idx on expert_bookings(transaction_id);
