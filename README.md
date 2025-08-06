# 📋 Guide Complet du Template XML - Métaprompts

Guide détaillé pour créer vos propres configurations XML et développer de nouveaux outils IA pour l'éducation.

![XML](https://img.shields.io/badge/XML-1.0-orange.svg)
![UTF-8](https://img.shields.io/badge/Encoding-UTF--8-blue.svg)
![Education](https://img.shields.io/badge/Domain-Education-green.svg)

## 🎯 Vue d'ensemble

Le format XML permet de définir des métaprompts configurables qui génèrent automatiquement des interfaces graphiques. Chaque fichier XML décrit :
- Les métadonnées de l'outil
- Le template du prompt avec variables
- Les champs de formulaire et leur comportement
- L'organisation de l'interface utilisateur

## 📐 Structure XML Complète

```xml
<?xml version="1.0" encoding="UTF-8"?>
<metaprompt_config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <!-- Informations sur l'outil -->
  </metadata>
  
  <prompt_template>
    <!-- Template du prompt avec variables -->
  </prompt_template>
  
  <variables>
    <!-- Définition des champs de formulaire -->
  </variables>
  
  <ui_configuration>
    <!-- Organisation de l'interface -->
  </ui_configuration>
</metaprompt_config>
```

## 📊 Section Metadata

Définit les informations générales de votre outil.

```xml
<metadata>
  <name>Nom de votre outil</name>
  <description>Description détaillée de ce que fait l'outil</description>
  <version>1.0</version>
  <tags>
    <tag>catégorie1</tag>
    <tag>catégorie2</tag>
    <tag>catégorie3</tag>
  </tags>
</metadata>
```

### Propriétés :

| Élément | Obligatoire | Description | Exemple |
|---------|-------------|-------------|---------|
| `name` | ✅ | Nom affiché de l'outil | "Générateur d'exercices" |
| `description` | ✅ | Description pour l'utilisateur | "Crée des exercices personnalisés" |
| `version` | ❌ | Version de la configuration | "1.0", "2.1.3" |
| `tags` | ❌ | Catégories pour l'organisation | quiz, cours, évaluation |

## 🔤 Section Prompt Template

Contient le modèle de prompt avec variables et logique conditionnelle.

```xml
<prompt_template><![CDATA[
Votre prompt ici avec des variables {{nom_variable}}.

Vous pouvez utiliser :
- Variables simples : {{variable}}
- Blocs conditionnels : {{#variable}}contenu{{/variable}}

Exemple :
Créez un {{type_exercice}} sur {{sujet}} pour des élèves de {{niveau}}.

{{#inclure_corrige}}
Incluez le corrigé détaillé.
{{/inclure_corrige}}

{{#duree}}
Durée estimée : {{duree}} minutes.
{{/duree}}
]]></prompt_template>
```

### Syntaxe des Variables :

| Syntaxe | Usage | Comportement |
|---------|--------|--------------|
| `{{variable}}` | Variable simple | Remplacée par la valeur |
| `{{#variable}}...{{/variable}}` | Bloc conditionnel | Affiché si variable a une valeur |
| Variables tableau | `{{liste_items}}` | Jointure automatique avec ", " |
| Variables booléennes | `{{#checkbox}}...{{/checkbox}}` | Affiché si coché |

## 🎛️ Section Variables

Définit tous les champs de formulaire avec leur comportement.

### Structure de Base d'une Variable

```xml
<variable name="nom_unique" required="true|false">
  <type>type_de_champ</type>
  <label>Libellé affiché</label>
  <!-- Propriétés spécifiques au type -->
</variable>
```

## 📝 Types de Champs Disponibles

### 1. Champ Texte (`text`)

```xml
<variable name="titre" required="true">
  <type>text</type>
  <label>Titre de l'exercice</label>
  <placeholder>Ex: Les fractions au CM2</placeholder>
  <validation>
    <min_length>5</min_length>
    <max_length>100</max_length>
  </validation>
</variable>
```

**Propriétés :**
- `placeholder` : Texte d'aide
- `validation/min_length` : Longueur minimale
- `validation/max_length` : Longueur maximale
- `default` : Valeur par défaut

### 2. Champ Numérique (`number`)

```xml
<variable name="nb_questions" required="true">
  <type>number</type>
  <label>Nombre de questions</label>
  <min>1</min>
  <max>50</max>
  <step>1</step>
  <default>10</default>
</variable>
```

**Propriétés :**
- `min` : Valeur minimale
- `max` : Valeur maximale
- `step` : Incrément
- `default` : Valeur par défaut

### 3. Zone de Texte (`textarea`)

```xml
<variable name="instructions" required="false">
  <type>textarea</type>
  <label>Instructions particulières</label>
  <placeholder>Ajoutez des consignes spécifiques...</placeholder>
  <rows>4</rows>
</variable>
```

**Propriétés :**
- `placeholder` : Texte d'aide
- `rows` : Hauteur en lignes
- `validation/min_length` : Longueur minimale
- `validation/max_length` : Longueur maximale

### 4. Liste Déroulante (`select`)

```xml
<variable name="niveau" required="true">
  <type>select</type>
  <label>Niveau scolaire</label>
  <options>
    <option value="cp">CP</option>
    <option value="ce1">CE1</option>
    <option value="ce2">CE2</option>
    <option value="cm1">CM1</option>
    <option value="cm2">CM2</option>
  </options>
  <default>cm1</default>
</variable>
```

**Propriétés :**
- `options/option@value` : Valeur technique
- `options/option[text]` : Texte affiché
- `default` : Option sélectionnée par défaut

### 5. Case à Cocher Simple (`checkbox`)

```xml
<variable name="inclure_corrige" required="false">
  <type>checkbox</type>
  <label>Inclure le corrigé</label>
  <default>true</default>
</variable>
```

**Propriétés :**
- `default` : `true` ou `false`

### 6. Groupe de Cases à Cocher (`checkbox_group`)

```xml
<variable name="types_questions" required="false">
  <type>checkbox_group</type>
  <label>Types de questions</label>
  <options>
    <option value="qcm">QCM</option>
    <option value="vrai_faux">Vrai/Faux</option>
    <option value="calcul">Calcul</option>
    <option value="redaction">Rédaction</option>
  </options>
  <default>["qcm", "calcul"]</default>
</variable>
```

**Propriétés :**
- `options` : Liste des choix possibles
- `default` : Tableau JSON des valeurs pré-cochées

### 7. Boutons Radio (`radio`)

```xml
<variable name="format" required="true">
  <type>radio</type>
  <label>Format de sortie</label>
  <options>
    <option value="pdf">Document PDF</option>
    <option value="word">Document Word</option>
    <option value="html">Page Web</option>
  </options>
  <default>pdf</default>
</variable>
```

**Propriétés :**
- `options` : Choix mutuellement exclusifs
- `default` : Valeur sélectionnée par défaut

### 8. Curseur de Valeurs (`range`)

```xml
<variable name="difficulte" required="true">
  <type>range</type>
  <label>Niveau de difficulté</label>
  <min>1</min>
  <max>10</max>
  <step>1</step>
  <default>5</default>
  <labels>
    <label value="1">Très facile</label>
    <label value="3">Facile</label>
    <label value="5">Moyen</label>
    <label value="7">Difficile</label>
    <label value="10">Très difficile</label>
  </labels>
</variable>
```

**Propriétés :**
- `min/max/step` : Plage et incrément
- `labels/label@value` : Étiquettes aux positions clés
- `default` : Position initiale

## 🎨 Section UI Configuration

Organise l'affichage du formulaire en sections.

```xml
<ui_configuration>
  <theme>education</theme>
  <layout>vertical</layout>
  <sections>
    <section name="Configuration de base" order="1">
      <fields>titre,niveau,nb_questions</fields>
    </section>
    <section name="Contenu pédagogique" order="2">
      <fields>types_questions,difficulte</fields>
    </section>
    <section name="Options avancées" order="3" collapsible="true">
      <fields>instructions,inclure_corrige,format</fields>
    </section>
  </sections>
</ui_configuration>
```

### Propriétés des Sections :

| Attribut | Description | Valeurs |
|----------|-------------|---------|
| `name` | Titre de la section | Texte libre |
| `order` | Ordre d'affichage | Nombre entier |
| `collapsible` | Section repliable | `true` / `false` |
| `fields` | Liste des champs | Noms séparés par virgules |

## 📋 Exemple Complet : Générateur de Devoirs

```xml
<?xml version="1.0" encoding="UTF-8"?>
<metaprompt_config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <name>Générateur de Devoirs Personnalisés</name>
    <description>Créez des devoirs adaptés au niveau et aux besoins de vos élèves</description>
    <version>1.2</version>
    <tags>
      <tag>devoir</tag>
      <tag>évaluation</tag>
      <tag>personnalisation</tag>
    </tags>
  </metadata>
  
  <prompt_template><![CDATA[
Créez un devoir de {{matiere}} pour des élèves de {{niveau}}.

Sujet principal : {{sujet}}
Nombre d'exercices : {{nb_exercices}}
Durée estimée : {{duree}} minutes

Types d'exercices à inclure :
{{types_exercices}}

Niveau de difficulté : {{difficulte}}/10

{{#inclure_bareme}}
Incluez un barème de notation détaillé.
{{/inclure_bareme}}

{{#inclure_conseils}}
Ajoutez des conseils méthodologiques pour les élèves.
{{/inclure_conseils}}

{{#adaptations_particulieres}}
Adaptations particulières : {{adaptations_particulieres}}
{{/adaptations_particulieres}}

{{#format_rendu}}
Format de rendu souhaité : {{format_rendu}}
{{/format_rendu}}
  ]]></prompt_template>
  
  <variables>
    <!-- Section Configuration de base -->
    <variable name="matiere" required="true">
      <type>select</type>
      <label>Matière</label>
      <options>
        <option value="mathematiques">Mathématiques</option>
        <option value="francais">Français</option>
        <option value="histoire">Histoire-Géographie</option>
        <option value="sciences">Sciences</option>
        <option value="anglais">Anglais</option>
      </options>
    </variable>
    
    <variable name="niveau" required="true">
      <type>select</type>
      <label>Niveau de classe</label>
      <options>
        <option value="cp">CP</option>
        <option value="ce1">CE1</option>
        <option value="ce2">CE2</option>
        <option value="cm1">CM1</option>
        <option value="cm2">CM2</option>
        <option value="6eme">6ème</option>
        <option value="5eme">5ème</option>
        <option value="4eme">4ème</option>
        <option value="3eme">3ème</option>
      </options>
    </variable>
    
    <variable name="sujet" required="true">
      <type>text</type>
      <label>Sujet principal du devoir</label>
      <placeholder>Ex: Les fractions, La Révolution française, Le système solaire...</placeholder>
      <validation>
        <min_length>5</min_length>
        <max_length>100</max_length>
      </validation>
    </variable>
    
    <!-- Section Paramètres du devoir -->
    <variable name="nb_exercices" required="true">
      <type>number</type>
      <label>Nombre d'exercices</label>
      <min>1</min>
      <max>10</max>
      <step>1</step>
      <default>4</default>
    </variable>
    
    <variable name="duree" required="true">
      <type>select</type>
      <label>Durée estimée</label>
      <options>
        <option value="20">20 minutes</option>
        <option value="30">30 minutes</option>
        <option value="45">45 minutes</option>
        <option value="60">1 heure</option>
        <option value="90">1h30</option>
        <option value="120">2 heures</option>
      </options>
      <default>45</default>
    </variable>
    
    
