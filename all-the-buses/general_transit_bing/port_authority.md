
```sql

DROP TABLE IF EXISTS gtfs_agency;

CREATE TABLE gtfs_agency (
	agency_id varchar(4),
	agency_name varchar(50),
	agency_url text,
	agency_timezone varchar(50),
	agency_lang varchar(2),
	agency_phone varchar(12),
	agency_fare_url text
);


DROP TABLE IF EXISTS gtfs_calendar;

CREATE TABLE gtfs_calendar (
	service_id varchar(50),
	monday boolean,
	tuesday boolean,
	wednesday boolean,
	thursday boolean,
	friday boolean,
	saturday boolean,
	sunday boolean,
	start_date date,
	end_date date
);


DROP TABLE IF EXISTS gtfs_calendar_dates;

CREATE TABLE gtfs_calendar_dates (
	service_id varchar(50),
	calendar_date date,
	exception integer
);


DROP TABLE IF EXISTS gtfs_routes;

CREATE TABLE gtfs_routes (
	route_id varchar(10),
	agency_id varchar(4),
	route_short_name varchar(5),
	route_long_name varchar(50),
	route_desc text,
	route_type integer,
	route_url text
);


DROP TABLE IF EXISTS gtfs_shapes;

CREATE TABLE gtfs_shapes (
	shape_id char(8),
	shape_pt_lat numeric,
	shape_pt_lon numeric,
	shape_pt_sequence integer
);


DROP TABLE IF EXISTS gtfs_stop_times;

CREATE TABLE gtfs_stop_times (
	trip_id varchar(20),
	arrival_time time,
	departure_time time,
	stop_id char(6),
	stop_sequence integer,
	pickup_type integer,
	drop_off_type integer
);


DROP TABLE IF EXISTS gtfs_stops;

CREATE TABLE gtfs_stops (
	stop_id char(6),
	stop_code integer,
	stop_name text,
	stop_desc text,
	stop_lat numeric, 
	stop_lon numeric,
	zone_id varchar(2)
);


DROP TABLE IF EXISTS gtfs_transfers;

CREATE TABLE gtfs_transfers (
	from_stop_id char(6),
	to_stop_id char(6),
	transfer_type integer
);


DROP TABLE IF EXISTS gtfs_trips;

CREATE TABLE gtfs_trips (
	route_id varchar(10),
	service_id varchar(50),
	trip_id varchar(20),
	trip_headsign text,
	direction_id integer,
	block_id varchar(12),
	shape_id char(8)
);
```

Replace times outside of the actual timeperiod.

```ruby
ruby -pi.bak -e "gsub(/24:(\d{2}):(\d{2})/, '00:\1:\2')" stop_times.txt
ruby -pi.bak -e "gsub(/25:(\d{2}):(\d{2})/, '01:\1:\2')" stop_times.txt
ruby -pi.bak -e "gsub(/26:(\d{2}):(\d{2})/, '02:\1:\2')" stop_times.txt
```

Load the data into PostgreSQL.

```bash
cd /Users/Shared/general_transit_bing
psql -c "COPY gtfs_agency FROM '/Users/Shared/agency.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_calendar FROM '/Users/Shared/calendar.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_calendar_dates FROM '/Users/Shared/calendar_dates.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_routes FROM '/Users/Shared/routes.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_shapes FROM '/Users/Shared/shapes.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_stop_times FROM '/Users/Shared/stop_times.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_stops FROM '/Users/Shared/stops.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_transfers FROM '/Users/Shared/transfers.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
psql -c "COPY gtfs_trips FROM '/Users/Shared/trips.txt' WITH DELIMITER ',' NULL '' CSV HEADER;" -p 5432 -d port_authority -U port_authority
```

```sql
ALTER TABLE gtfs_trips ADD start_time time;
ALTER TABLE gtfs_trips ADD end_time time;
```

Set the start time of each trip.


```sql
UPDATE gtfs_trips AS t1
SET start_time = t2.start_time
FROM (
	SELECT trip_id, arrival_time as start_time
	FROM gtfs_stop_times
	WHERE stop_sequence = 1
) AS t2
WHERE t1.trip_id = t2.trip_id;
```


Set the end time of each trip.

```sql
UPDATE gtfs_trips AS t1
SET end_time = t2.end_time
FROM (
	SELECT m.trip_id, m.arrival_time as end_time
	FROM (
	    SELECT trip_id, MAX(stop_sequence) AS stop_sequence_max
	    FROM gtfs_stop_times
	    GROUP BY trip_id
	) t JOIN gtfs_stop_times m ON m.trip_id = t.trip_id AND t.stop_sequence_max = m.stop_sequence
) AS t2
WHERE t1.trip_id = t2.trip_id;
```



Get active trips.


```sql
SELECT *
FROM gtfs_stop_times
WHERE trip_id IN (
	SELECT trip_id
	FROM gtfs_trips t
	WHERE 
	  t.start_time <= CURRENT_TIME AND 
	  t.end_time >= CURRENT_TIME
) AND
departure_time <= CURRENT_TIME;
```

Add PostGIS to our database.


```sql
CREATE EXTENSION postgis;
ALTER TABLE gtfs_shapes ADD COLUMN geom geometry(POINT,4326);
UPDATE gtfs_shapes SET geom = ST_SetSRID( ST_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
ALTER TABLE gtfs_stops ADD COLUMN geom geometry(POINT,4326);
UPDATE gtfs_stops SET geom = ST_SetSRID( ST_MakePoint(stop_lon, stop_lat), 4326);

```

Create lines for each of the shapes.


```sql
DROP TABLE IF EXISTS gtfs_shape_lines;
CREATE TABLE gtfs_shape_lines (
	route_id varchar(10),
	shape_id char(8),
	geom geometry(LINESTRING,4326)
);

INSERT INTO gtfs_shape_lines
SELECT DISTINCT t.route_id, s.shape_id, s.geom
FROM gtfs_trips AS t, 
(SELECT 
shape_id, ST_MakeLine(geom ORDER BY shape_pt_sequence) AS geom
FROM gtfs_shapes
GROUP BY shape_id
) AS s
WHERE s.shape_id = t.shape_id
```


Export the lines to geojson for the web app.

```bash
ogr2ogr -f GeoJSON out.json "PG:host=localhost dbname=port_authority user=port_authority password=port_authority" -sql 'select shape_id, geom from gtfs_shape_lines;'
```





```sql
CREATE TEMP TABLE active_trip_stops AS SELECT gtfs_stop_times.trip_id, gtfs_stop_times.stop_sequence, gtfs_stops.geom
FROM gtfs_stop_times JOIN gtfs_stops ON gtfs_stop_times.stop_id = gtfs_stops.stop_id
WHERE trip_id IN (
	SELECT trip_id
	FROM gtfs_trips t
	WHERE 
	  t.start_time <= time '09:00' AND 
	  t.end_time >= time '09:00'
) AND
departure_time <= time '09:00';

CREATE TEMP TABLE active_trip_stop_paths AS SELECT trip_id, ST_MakeLine(geom ORDER BY t2.stop_sequence) as geom
FROM active_trip_stops AS t2
GROUP BY trip_id;
```


```ruby
require 'pg'
require 'json'

sql = "SELECT route_id, current_stops.trip_id, ST_X( ST_ClosestPoint(gtfs_shape_lines.geom, current_stops.geom) ) as lon, ST_Y( ST_ClosestPoint(gtfs_shape_lines.geom, current_stops.geom) ) as lat FROM gtfs_shape_lines, gtfs_trips, (SELECT DISTINCT ON (trip_id) gtfs_stop_times.trip_id, gtfs_stops.geom FROM gtfs_stop_times, gtfs_stops, (SELECT trip_id FROM gtfs_trips t WHERE t.start_time <= time '09:00' AND t.end_time >= time '09:00' ) AS active_trips WHERE gtfs_stop_times.trip_id = active_trips.trip_id AND gtfs_stop_times.stop_id = gtfs_stops.stop_id AND gtfs_stop_times.departure_time <= time '09:00' ORDER BY trip_id, stop_sequence DESC ) as current_stops WHERE gtfs_shape_lines.shape_id = gtfs_trips.shape_id AND gtfs_trips.trip_id = current_stops.trip_id AND gtfs_trips.service_id IN ('1511-Collier-Weekday-24','1511-Liberty-Weekday-22','1511-Mifflin-Weekday-26','1511-Ross-Weekday-22','1511-Village-Weekday-22');"
conn = PGconn.open( dbname: 'port_authority', user: 'port_authority', password: 'port_authority')

positions = {}

0.upto(23) do |i|
  h = (i + 4) % 24
  0.upto(59) do |m|
    t = "#{ h.to_s.rjust(2, '0') }:#{ m.to_s.rjust(2, '0') }"
    r = conn.exec(sql.gsub('09:00',t))
    positions[t] = r.values
  end
end

File.open('/Users/Shared/positions.json','wb') do |f|
  f.write(positions.to_json)
end

```






exec "ogr2ogr -f GeoJSON out-#{t}.json 'PG:host=localhost dbname=port_authority user=port_authority password=port_authority' -sql "





