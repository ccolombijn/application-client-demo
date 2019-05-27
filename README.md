Applicatie

||
||
||

Een applicatie wordt gedefinieerd door een applicatie object wat (ten minste) een **config** en **name **property bevat;
De **name** property is een string met de naam van de applicatie
In het **config** object worden (ten minste) **main**, **nav** en **default** gedefinieerd;

-   **main** property is een string met een verwijzing naar het element waar (HTML) content in wordt geladen ;
-   **nav** is een string met een verwijzing naar het element waar de hoofdnavigatie van de applicatie moet worden geladen;
-   **default** is een string met de standaard module die wordt aangeroepen als de applicatie wordt geopend

<span id="anchor"></span>Module

||
||
||

Modules worden gedefinieerd als objecten met ten minste een **default** en **name **property.

-   **default** bevat functie (of verwijzing daarnaar) die standaard wordt aangeroepen;
-   **name **wordt weergegeven in titel, header en navigatie

Aan modules kunnen verder ieder andere benodigde properties worden toegevoegd. Als dit functies zijn, dan kunnen deze als submodules/methods worden aangeroepen. Module properties worden ook door application.render gebruikt om pagina elementen aan te passen.

<span id="anchor-1"></span>

<span id="anchor-2"></span>application.init

Applicatie wordt geïnitieerd met application.init

||
||
||

(Wanneer [*application.add*](#135l6knucg8f)[* *](#135l6knucg8f)wordt gebruikt; alternatieve manier om properties en modules te definiëren, hoeft *myApplication* niet opgegeven te worden en kan application.init vanuit de applicatie zelf opgeroepen worden.)

Als application.init wordt aangeroepen, wordt het applicatie object geladen en worden de volgende functies uitgevoerd;

-   [*application.load*](#xc7zrfj1zjsf)** (**aanroepen en uitvoeren module)
-   [*application.page*](#u25x7fmymaox) (weergave pagina)
-   [*application.render*](#2v9e0ksicwlv) (koppeling module object en pagina)

<span id="anchor-3"></span>

<span id="anchor-4"></span>application.load

Naast application.init is dit de belangrijkste functie van application omdat deze er voor zorgt dat toegevoegde modules in application.object worden uitgevoerd a.h.v. application.route / application.endpoint.

Als hashchange** **event wordt aangeroepen (als hash link - gedeelte in url na \# - veranderd; ) wordt de desbetreffende module uitgevoerd met application.load;

Link naar bijv. index.html\#myModule voert myModule.default() uit. In onderstaand voorbeeld wordt met een link naar \#myModule/myMethod/test door application.load zal myModule.myMethod(‘test’) worden uitgevoerd in het volgende voorbeeld;

||
||
||

De module die in config.default is gedefinieerd wordt standaard uitgevoerd bij het openen van bijv. index.html (als er geen hash link is opgegegeven); in dat geval wordt myModule.default()** **dus ook uitgevoerd omdat ‘myModule’ is opgegeven als default in het config object.

<span id="anchor-5"></span>

<span id="anchor-6"></span>application.add

Een andere manier om properties en modules toe te voegen is met application.add ;

||
||
||

Voordeel is dat modules niet gedefinieerd hoeven te worden vanuit de applicatie, maar al aan application.object zijn toegevoegd als application.init wordt aangeroepen.

||
||
||

Applicatie kan dan zonder applicatie object als argument (omdat application.add deze al heeft toegevoegd aan application.object) geïnitieerd met application.init

||
||
||

<span id="anchor-7"></span>

<span id="anchor-8"></span>application.template

application.template representeert de template property van applicatie en modules. Als template property van module niet is gedefinieerd dan wordt de waarde van de template property van de applicatie gebruikt.

||
||
||

Vervolgens wordt door application.page het bestand *assets/html/templates/myTemplate.html* geladen

||
||
||

<span id="anchor-9"></span>

<span id="anchor-10"></span>application.render

application.render zorgt er voor dat het module object en pagina( elementen ) door application.page geladen, met elkaar gekoppeld zijn.

In myModule kan bijv. een property content benoemd worden

||
||
||

In het template bestand (*assets/html/templates/myTemplate.html*) kan via de class attribute van elementen naar properties verwezen worden.

||
||
||

De waarden van name en content properties in het module object zullen dan door application.render in de pagina weergegeven worden.

Als object properties worden aangepast, dan kan application.render worden aangeroepen om deze wijzigingen direct in de pagina weer te geven;

||
||
||

In het volgende voorbeeld wordt h2.name geupdate bij invoer in input\#myInput

||
||
||

<span id="anchor-11"></span>

<span id="anchor-12"></span>application.page

application.page zorgt er voor dat de pagina wordt geladen en beschikbaar is voordat de module wordt uitgevoerd.

<span id="anchor-13"></span>

<span id="anchor-14"></span>application.nav

application.nav zorgt er voor dat gedefinieerde modules als links worden toegevoegd aan het element wat in config.nav is opgegeven.
