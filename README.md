# 🏰 Tower Defense

Selainpohjainen Tower Defense -peli, jossa pelaaja rakentaa ja päivittää torneja puolustaakseen tukikohtaa vihollisaalloilta.

## 🎮 Pelin tavoite

Tavoitteena on selviytyä mahdollisimman monesta vihollisaallosta, kerätä rahaa ja pisteitä sekä päästä TOP 10 -listalle.

## ✨ Ominaisuudet

- 🏰 3 erilaista tornia
- ⬆️ Tornien päivittäminen
- 💰 Tornien ostaminen ja myyminen
- 🎯 3 erilaista targetointitapaa
- 👾 4 erilaista vihollista
- 👑 Boss-viholliset
- 🌊 Kasvava vaikeustaso
- ❤️ Tukikohdan elämäpisteet
- 💰 Rahajärjestelmä
- 🏆 Pistejärjestelmä
- 🥇 TOP 10 -leaderboard
- ☁️ AWS Lambda + API Gateway
- ✨ Partikkeliefektit
- 🎯 Tornien kantaman näyttäminen
- 📊 Reaaliaikainen pelitilanne

## 🕹️ Pelaaminen

### Tornien rakentaminen

Valitse torni ja klikkaa kartalta sopivaa paikkaa.

Torneja ei voi rakentaa:

- Reitin päälle
- Tukikohdan päälle
- Liian lähelle toista tornia
- Kartan ulkopuolelle

### Tornit

#### 🟦 Basic Tower

Tasapainoinen perustorni.

- Edullinen
- Hyvä vahinko
- Hyvä kantama
- Keskinopea hyökkäys

#### 🟩 Rapid Tower

Nopeasti ampuva torni.

- Nopea hyökkäys
- Pienempi vahinko
- Sopii tavallisia vihollisia vastaan

#### 🟥 Cannon Tower

Raskas tykki.

- Suuri vahinko
- Pitkä kantama
- Hidas hyökkäys
- Aluevaurio

## 🎯 Targetointi

Torneille voidaan valita kolme eri targetointitapaa:

### First

Tähtää pisimmälle reitillä edenneeseen viholliseen.

### Last

Tähtää vähiten reitillä edenneeseen viholliseen.

### Strongest

Tähtää viholliseen, jolla on eniten HP:tä.

## 👾 Viholliset

| Vihollinen | Nopeus | HP | Palkkio |
|---|---:|---:|---:|
| 🔴 Normal | 1.25 | 100 | 10 |
| 🟡 Fast | 2.1 | 65 | 15 |
| 🟣 Tank | 0.75 | 450 | 30 |
| 👑 Boss | 0.55 | 2200 | 150 |

Vihollisten HP ja vaikeus kasvavat aaltojen mukana.

## 👑 Bossit

Boss ilmestyy joka viidennellä aallolla.

Bossilla on:

- Paljon HP:tä
- Suuri koko
- Erityinen aura
- Kruunu
- Oma HP-palkki
- Suuri rahapalkkio
- Erikoisefektit

Bossien vaikeus kasvaa myöhemmissä aalloissa.

## 🌊 Aallot

Jokainen aalto sisältää enemmän vihollisia.

Aaltojen mukana:

- Vihollisten HP kasvaa
- Vihollisten nopeus kasvaa
- Vihollisten määrä kasvaa
- Uusia vihollistyyppejä ilmestyy
- Bossit tulevat mukaan peliin

Kun aalto suoritetaan, pelaaja saa rahabonuksen.

## ⬆️ Tornien päivittäminen

Valitse rakennettu torni klikkaamalla sitä.

Päivitys:

- Lisää vahinkoa
- Lisää kantamaa
- Nostaa tornin tasoa
- Maksaa rahaa

Päivitysten hinta kasvaa tornin tason mukaan.

## 💰 Tornien myyminen

Tornin voi myydä milloin tahansa.

Myynnistä saa takaisin osan torniin käytetystä rahasta.

## ❤️ Tukikohta

Pelaajalla on alussa:

**10 ❤️**

Jos vihollinen pääsee reitin loppuun, pelaaja menettää yhden elämäpisteen.

Kun elämäpisteet saavuttavat nollan, peli päättyy.

## 🏆 Pisteet

Pisteitä saa:

- Vihollisten tuhoamisesta
- Bossien tuhoamisesta
- Aaltojen suorittamisesta

Game Over -tilanteessa pelaaja voi syöttää nimensä ja tallentaa pisteensä TOP 10 -listalle.

## ☁️ AWS Leaderboard

Leaderboard käyttää AWS Lambdaa ja API Gatewayta.

Arkkitehtuuri:

Selain
↓
API Gateway
↓
AWS Lambda
↓
Leaderboard / tietokanta

### GET /scores

Hakee TOP 10 -tulokset.

### POST /scores

Tallentaa uuden tuloksen.

Esimerkkidata:

```json
{
  "playerName": "Pelaaja",
  "score": 1000,
  "wave": 10
}

🛠️ Teknologiat
HTML5
CSS3
JavaScript
HTML Canvas API
Fetch API
AWS Lambda
AWS API Gateway
📁 Projektin rakenne
tower-defense/
│
├── index.html
├── style.css
├── game.js
└── README.md
🧠 Tekninen toteutus

Peli käyttää HTML5 Canvasia pelimaailman piirtämiseen.

Game Loop päivittää:

Aallot
Viholliset
Tornit
Luodit
Efektit
Floating Text -tekstit

Tämän jälkeen Canvas piirtää pelin uuden tilanteen.

🎯 Tornien targetointi

Tornit etsivät kantamansa sisällä olevat viholliset.

Targetointi perustuu vihollisen etenemiseen ja HP-määrään.

Tornit voivat valita esimerkiksi pisimmälle edenneen tai vahvimman vihollisen.

💥 Efektit

Pelissä on erilaisia visuaalisia efektejä:

Tornin rakentaminen
Tornin päivittäminen
Osumat
Vihollisen kuolema
Räjähdykset
Bossin kuolema
Floating Text -ilmoitukset
⚖️ Pelin tasapainotus

Pelissä on tasapainotettu:

Tornien hinnat
Tornien vahingot
Tornien hyökkäysnopeudet
Tornien kantamat
Vihollisten HP
Vihollisten nopeudet
Rahapalkkiot
Päivitysten hinnat
Aaltojen vaikeutuminen

Tavoitteena on tehdä pelistä haastava mutta pelattava.

🚀 Käynnistäminen

Lataa projekti:

git clone <repository-url>

Siirry projektikansioon:

cd tower-defense

Avaa projekti esimerkiksi Visual Studio Codessa ja käynnistä index.html Live Serverillä.