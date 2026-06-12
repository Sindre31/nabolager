-- Nabolager — seed data (ported verbatim from the design prototype)
-- Run after 0001_init.sql.

-- Demo user / host -----------------------------------------------------------
insert into public.profiles (id, name, initials, city, member_since, rating, tenancies, as_host)
values ('00000000-0000-0000-0000-000000000001', 'Ola Nordmann', 'O', 'Oslo', '2026', 4.9, 2, 2)
on conflict (id) do nothing;

-- Listings -------------------------------------------------------------------
insert into public.listings
  (id, num, title, type, city, area, distance, size_m2, size_m3, price, rating, reviews, ph, avail,
   features, description, access, rules, coords,
   host_name, host_initials, host_since, host_verified, host_rating, host_reviews,
   owner_id, status, views)
values
('l1','01','Tørr kjellerbod på Grünerløkka','Bod','Oslo','Grünerløkka','0,4 km fra T-bane',6,14,690,4.9,47,'kjellerbod · 6 m²','Ledig fra 15. mai',
  array['24/7 tilgang','Tørt og temperert','Kodelås','Kameraovervåket'],
  'Romslig bod i kjelleren av en bygård fra 1898. Helt tørt og fritt for fukt — brukes selv til verktøy og sesongdekk. Egen kodelås, du kommer til når du vil.',
  'Du får egen kodelås. Felles trapp opp til gateplan.',
  array['Ikke brann-/eksplosjonsfarlig','Ikke matvarer','Forsikring opptil 50 000 kr'],
  '{"x":30,"y":40}','Marte Hagen','MH','2024',true,4.9,47,
  '00000000-0000-0000-0000-000000000001','active',128),
('l2','02','Garasje ved Sognsvann','Garasje','Oslo','Nordberg','Ved hovedvei',18,45,1490,4.8,28,'garasje · 18 m²','Ledig nå',
  array['Bil-tilgang','Strømuttak','Egen port','24/7 tilgang'],
  'Frittstående enkeltgarasje på egen tomt. Kan brukes til bil, motorsykkel eller som rent lager. Strømuttak til lader. Asfaltert innkjørsel.',
  'Egen port med portåpner. Asfaltert innkjørsel helt frem.',
  array['Ingen overnatting','Ikke kjemikalielagring','Tobakksfritt'],
  '{"x":18,"y":22}','Erik Bjerke','EB','2023',true,4.8,28,
  '00000000-0000-0000-0000-000000000001','rented',64),
('l3','03','Loft over snekkerverksted','Loft','Oslo','Sagene','5 min fra Torshov',22,48,1190,5.0,63,'loft · 22 m²','Ledig fra 1. juni',
  array['Tørt og temperert','Heisbar','Tilgang dagtid'],
  'Stort åpent loft med god takhøyde i midten. Egnet for store gjenstander, sesongvarer og lett næringslager. Trebjelker og takvindu.',
  'Heisbar opp. Tilgang man–lør 07–20.',
  array['Ingen brennbar væske','Tilgang dagtid'],
  '{"x":44,"y":24}','Sofia Lien','SL','2022',true,5.0,63,
  null,'active',0),
('l4','04','Container på industritomt','Container','Oslo','Alnabru','Ved E6 — bil/lastebil',13,34,1290,4.7,112,'container · 20 fot','Ledig nå',
  array['20-fots container','Bil-tilgang','24/7 tilgang','Kameraovervåket'],
  'Sjøcontainer på sikret industritomt, lett tilgjengelig med bil eller varebil. Belyst og kameraovervåket gårdsplass. Perfekt for bygningsmaterialer.',
  'Eget hengelås-punkt. Kjør helt frem med varebil.',
  array['Forsikring over 30 000 kr ordnes selv','Ikke beboelse'],
  '{"x":78,"y":62}','Lager Øst AS','LØ','2021',true,4.7,112,
  null,'active',0),
('l5','05','Kjellerbod i bryggehus','Bod','Bergen','Bryggen','200 m fra Bryggen',5,11,590,4.9,31,'bod · 5 m²','Ledig fra 2. juni',
  array['Tørt og temperert','Kodelås','Tilgang dagtid'],
  'Liten, men tørr bod i et restaurert bryggehus. Eldre murvegger fra 1700-tallet, helt tørt. Sjarmerende beliggenhet med trange trapper.',
  'Kodelås. Tilgang 07–22.',
  array['Ingen overnatting','Tilgang 07–22'],
  '{"x":38,"y":32}','Henrik Vassdal','HV','2024',true,4.9,31,
  null,'active',0),
('l6','06','Oppvarmet garasje på Landås','Garasje','Bergen','Landås','10 min fra sentrum',16,40,1290,4.8,22,'garasje · 16 m²','Ledig nå',
  array['Bil-tilgang','Strømuttak','Tørt og temperert','24/7 tilgang'],
  'Oppvarmet garasje med automatisk port. Veldig tørr — perfekt for Bergens-vinteren. Egnet for bil, sykler og verktøy.',
  'Automatisk port med fjernkontroll.',
  array['Røykfritt','Ikke kjemikalier'],
  '{"x":60,"y":56}','Ingrid Skog','IS','2023',true,4.8,22,
  null,'active',0),
('l7','07','Stort loft i sjøhus','Loft','Bergen','Sandviken','Ved fjorden',28,65,1390,5.0,41,'loft · 28 m²','Ledig fra 10. juni',
  array['Heisbar','Tilgang dagtid','Strømuttak'],
  'Loft i historisk sjøhus med kraftige bjelker og god takhøyde. Bilkjøring helt frem til døren. Kan deles eller leies som helhet.',
  'Heisbar. Bilkjøring til døren.',
  array['Ingen brennbar væske','Tilgang 06–22'],
  '{"x":42,"y":22}','Bjørn Krog','BK','2022',true,5.0,41,
  null,'active',0),
('l8','10','Dobbelgarasje på Lerkendal','Garasje','Trondheim','Lerkendal','10 min fra sentrum',20,50,1390,4.7,26,'garasje · 20 m²','Ledig fra 8. juni',
  array['Bil-tilgang','Strømuttak','Egen port','24/7 tilgang'],
  'Romslig dobbelgarasje, plass til to biler eller bil + lager. Strømuttak og lys i hele garasjen.',
  'Egen port med portåpner.',
  array['Tobakksfritt','Ikke kjemikalier'],
  '{"x":40,"y":70}','Tor Andersen','TA','2023',true,4.7,26,
  null,'active',0),
('l9','11','Industriseksjon ved Heimdal','Industri','Trondheim','Heimdal','Ved E6, lasterampe',32,96,2390,4.8,64,'industri · 32 m²','Ledig nå',
  array['Lasterampe','Bil-tilgang','Klimakontroll','24/7 tilgang'],
  'Profesjonelt mellomlager med rampe og truck-tilgang. Egnet for e-handel og småbedrift. Klimakontrollert.',
  'Lasterampe. Bemannet 07–18.',
  array['Bemannet 07–18','Ikke farlig gods'],
  '{"x":30,"y":84}','Midt Lager AS','ML','2020',true,4.8,64,
  null,'active',0)
on conflict (id) do nothing;

-- Favourites (matches design: l1, l3 saved by the demo user) -----------------
insert into public.favorites (profile_id, listing_id) values
('00000000-0000-0000-0000-000000000001','l1'),
('00000000-0000-0000-0000-000000000001','l3')
on conflict do nothing;

-- Incoming booking requests (host inbox) -------------------------------------
insert into public.requests (id, listing_id, from_name, message, time_label, status) values
('00000000-0000-0000-0000-0000000000a1','l1','Martin Berg','Hei! Er den ledig fra 1. juni i tre måneder?','I dag 14:22','pending'),
('00000000-0000-0000-0000-0000000000a2','l2','Emma Johansen','Funker plassen for en varebil (Transporter)?','I går','pending'),
('00000000-0000-0000-0000-0000000000a3','l1','Lars Sørensen','Kan jeg komme på en kjapp visning lørdag?','Tirsdag','pending')
on conflict (id) do nothing;
