🏰 Tower Defense

Selainpohjainen Tower Defense -peli, jossa pelaaja rakentaa torneja ja puolustautuu vihollisaaltoja vastaan. Projektissa on toteutettu pelin keskeinen logiikka sekä AWS-pohjainen backend pisteiden ja Top-listan käsittelyä varten.

🎮 Ominaisuudet

Tower Defense -pelimekaniikka

Vihollisten liikkuminen ja vihollisaallot

Tornien rakentaminen

Tornien hyökkäysmekaniikka

Pisteiden käsittely

Top-lista / leaderboard

REST API -rajapinta

AWS Lambda -backend

AWS API Gateway

Selainpohjainen käyttöliittymä

🛠️ Teknologiat

JavaScript

HTML

CSS

AWS Lambda

AWS API Gateway

REST API

☁️ AWS-arkkitehtuuri

Selain
   │
   ▼
API Gateway
   │
   ▼
AWS Lambda
   │
   ▼
REST API / backend-logiikka

API Gateway vastaanottaa HTTP-pyynnöt ja välittää ne Lambda-funktiolle, joka käsittelee backend-logiikan.

🚀 Käynnistys

1. Kloonaa repository

git clone https://github.com/AnttiF1/tower-defence.git
cd tower-defence

2. Avaa projekti

Avaa peli selaimessa projektin HTML-tiedoston kautta tai käytä projektissa määriteltyä paikallista kehityspalvelinta.

🎯 Projektin tavoite

Projektin tavoitteena oli rakentaa toimiva selainpohjainen Tower Defense -peli ja samalla harjoitella käytännön ohjelmistokehitystä.

Projektissa on harjoiteltu erityisesti:

JavaScript-ohjelmointia

pelilogiikan suunnittelua

käyttöliittymän toteuttamista

tapahtumankäsittelyä

REST-rajapintojen käyttöä

AWS Lambda -funktioita

API Gatewayn käyttöä

frontendin ja backendin välistä tiedonsiirtoa

📊 Leaderboard

Pelin pisteitä käsitellään backendin kautta ja pelaajien tuloksia voidaan hyödyntää Top-listassa.