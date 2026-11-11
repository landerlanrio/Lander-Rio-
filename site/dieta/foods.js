// LANDER RIO Food Catalog — 2026.09.22-v1
// Base normalizada por 100 g de parte comestível. Estado/preparo é obrigatório.

export const DATA_SOURCES = {
  "TBCA": {
    "name": "TBCA — Tabela Brasileira de Composição de Alimentos",
    "url": "https://www.tbca.net.br/",
    "scope": "Alimentos brasileiros; entradas com código TBCA são validações diretas.",
    "licenseNote": "Base pública consultável; conferir termos vigentes antes de redistribuição em massa."
  },
  "TACO": {
    "name": "TACO — Tabela Brasileira de Composição de Alimentos, 4ª edição",
    "url": "https://nepa.unicamp.br/tabela-brasileira-de-composicao-de-alimentos-4a-edicao/",
    "scope": "Referência brasileira para alimentos e preparações comuns.",
    "licenseNote": "Publicação do NEPA/UNICAMP disponibilizada publicamente."
  },
  "USDA_FDC": {
    "name": "USDA FoodData Central",
    "url": "https://fdc.nal.usda.gov/",
    "scope": "Fallback para alimentos genéricos sem equivalente brasileiro adequado.",
    "licenseNote": "Dados em domínio público/CC0; API de produção exige chave mantida no servidor."
  },
  "LABEL": {
    "name": "Rótulo do fabricante",
    "url": null,
    "scope": "Suplementos e industrializados com variação material entre marcas.",
    "licenseNote": "O rótulo do produto efetivamente consumido prevalece."
  }
};

export const CATALOG_INFO = {
  "id": "lander-rio-food-catalog-br",
  "version": "2026.09.22-v1",
  "releasedAt": "2026-09-22",
  "basis": "100 g de parte comestível",
  "strategy": "Brasil-first: TBCA/TACO → USDA FDC → rótulo da marca",
  "foods": 36,
  "schemaVersion": 1,
  "directVerified": 8,
  "note": "Estado/preparo faz parte da identidade do alimento; cru e cozido não são intercambiáveis."
};

export const FOODS = [
  {
    "id": "arroz",
    "name": "Arroz branco polido, cozido, sem óleo e sem sal",
    "kcal": 131,
    "p": 2.38,
    "c": 30,
    "f": 0.41,
    "fiber": 1.2,
    "state": "cozido",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 3,
    "pre": 3,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRC0018A",
    "ref": "Arroz polido, cozido, s/ óleo, s/ sal, Brasil",
    "source": {
      "provider": "TBCA",
      "code": "BRC0018A",
      "reference": "Arroz polido, cozido, s/ óleo, s/ sal, Brasil",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "feijao",
    "name": "Feijão carioca cozido com caldo",
    "kcal": 76,
    "p": 4.8,
    "c": 13.6,
    "f": 0.5,
    "fiber": 8.5,
    "state": "cozido",
    "role": "legume",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner"
    ],
    "satiety": 5,
    "pre": 1,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição — feijão carioca cozido",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "frango",
    "name": "Peito de frango grelhado",
    "kcal": 159,
    "p": 32,
    "c": 0,
    "f": 2.5,
    "fiber": 0,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "snack",
      "pre",
      "post",
      "breakfast"
    ],
    "satiety": 4,
    "pre": 4,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "patinho",
    "name": "Patinho bovino magro",
    "kcal": 219,
    "p": 35.9,
    "c": 0,
    "f": 7.3,
    "fiber": 0,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore"
    ],
    "budget": 2,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 5,
    "pre": 2,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "ovo",
    "name": "Ovo de galinha inteiro, cozido, sem sal",
    "kcal": 125,
    "p": 10.4,
    "c": 1.38,
    "f": 8.7,
    "fiber": 0,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "dinner",
      "ceia",
      "pre",
      "lunch"
    ],
    "satiety": 4,
    "pre": 3,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRC0010J",
    "ref": "Ovo, galinha, inteiro, cozido, s/ sal, Brasil",
    "source": {
      "provider": "TBCA",
      "code": "BRC0010J",
      "reference": "Ovo, galinha, inteiro, cozido, s/ sal, Brasil",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "clara_ovo",
    "name": "Clara de ovo",
    "kcal": 48,
    "p": 10.9,
    "c": 0.7,
    "f": 0.2,
    "fiber": 0,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "lunch",
      "dinner",
      "snack",
      "pre",
      "post"
    ],
    "satiety": 4,
    "pre": 4,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "tilapia",
    "name": "Tilápia grelhada",
    "kcal": 128,
    "p": 26,
    "c": 0,
    "f": 2.7,
    "fiber": 0,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore"
    ],
    "budget": 2,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 4,
    "pre": 4,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "sardinha",
    "name": "Sardinha",
    "kcal": 208,
    "p": 24.6,
    "c": 0,
    "f": 11.5,
    "fiber": 0,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner"
    ],
    "satiety": 5,
    "pre": 1,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "pao",
    "name": "Pão integral",
    "kcal": 253,
    "p": 9.4,
    "c": 49,
    "f": 3.7,
    "fiber": 6.5,
    "state": "pronto",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "pre",
      "ceia"
    ],
    "satiety": 3,
    "pre": 5,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "tapioca",
    "name": "Tapioca preparada",
    "kcal": 232,
    "p": 0.4,
    "c": 57.5,
    "f": 0.1,
    "fiber": 0.2,
    "state": "pronto",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "pre",
      "post"
    ],
    "satiety": 2,
    "pre": 5,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "cuscuz",
    "name": "Cuscuz de milho cozido no vapor, sem sal",
    "kcal": 109,
    "p": 2.16,
    "c": 24.7,
    "f": 0.68,
    "fiber": 2.05,
    "state": "cozido",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "lunch",
      "dinner",
      "pre"
    ],
    "satiety": 3,
    "pre": 4,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRC0409A",
    "ref": "Farinha de milho, cuscuz, cozido no vapor, s/ sal, Brasil",
    "source": {
      "provider": "TBCA",
      "code": "BRC0409A",
      "reference": "Farinha de milho, cuscuz, cozido no vapor, s/ sal, Brasil",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "aveia",
    "name": "Aveia em flocos",
    "kcal": 394,
    "p": 13.9,
    "c": 66.6,
    "f": 8.5,
    "fiber": 9.1,
    "state": "seco",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "pre",
      "ceia"
    ],
    "satiety": 5,
    "pre": 3,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "leite",
    "name": "Leite semidesnatado",
    "kcal": 46,
    "p": 3.2,
    "c": 4.8,
    "f": 1.6,
    "fiber": 0,
    "state": "líquido",
    "role": "dairy",
    "diets": [
      "omnivore",
      "vegetarian"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "ceia",
      "post"
    ],
    "satiety": 2,
    "pre": 4,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "iogurte",
    "name": "Iogurte natural, média de amostras",
    "kcal": 57,
    "p": 4.02,
    "c": 4.76,
    "f": 2.43,
    "fiber": 0,
    "state": "pronto",
    "role": "dairy",
    "diets": [
      "omnivore",
      "vegetarian"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "ceia",
      "post"
    ],
    "satiety": 3,
    "pre": 4,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRC0020G",
    "ref": "Iogurte, natural, Brasil (média de diferentes amostras)",
    "source": {
      "provider": "TBCA",
      "code": "BRC0020G",
      "reference": "Iogurte, natural, Brasil (média de diferentes amostras)",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "queijo",
    "name": "Queijo Minas frescal",
    "kcal": 243,
    "p": 15.9,
    "c": 3.02,
    "f": 18.6,
    "fiber": 0,
    "state": "pronto",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian"
    ],
    "budget": 2,
    "slots": [
      "breakfast",
      "snack",
      "ceia"
    ],
    "satiety": 4,
    "pre": 2,
    "post": 2,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRC0052G",
    "ref": "Queijo, Minas, frescal, Brasil",
    "source": {
      "provider": "TBCA",
      "code": "BRC0052G",
      "reference": "Queijo, Minas, frescal, Brasil",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "whey",
    "name": "Whey protein",
    "kcal": 400,
    "p": 78,
    "c": 8,
    "f": 6,
    "fiber": 0,
    "state": "pó",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian"
    ],
    "budget": 3,
    "slots": [
      "breakfast",
      "snack",
      "pre",
      "post",
      "ceia",
      "lunch",
      "dinner"
    ],
    "satiety": 2,
    "pre": 5,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "LABEL",
      "reference": "Rótulo nutricional da marca escolhida",
      "status": "variable-by-brand",
      "verifiedAt": "2026-09-22"
    },
    "requiresLabelConfirmation": true
  },
  {
    "id": "proteina_vegetal",
    "name": "Proteína vegetal em pó (ervilha/arroz)",
    "kcal": 380,
    "p": 75,
    "c": 10,
    "f": 5,
    "fiber": 3,
    "state": "pó",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 3,
    "slots": [
      "breakfast",
      "snack",
      "pre",
      "post",
      "ceia",
      "lunch",
      "dinner"
    ],
    "satiety": 2,
    "pre": 5,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "LABEL",
      "reference": "Rótulo nutricional da marca escolhida",
      "status": "variable-by-brand",
      "verifiedAt": "2026-09-22"
    },
    "requiresLabelConfirmation": true
  },
  {
    "id": "banana",
    "name": "Banana prata, in natura",
    "kcal": 107,
    "p": 1.11,
    "c": 25.9,
    "f": 0.28,
    "fiber": 1.95,
    "state": "cru",
    "role": "fruit",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "pre",
      "post",
      "ceia"
    ],
    "satiety": 3,
    "pre": 5,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRC0011C",
    "ref": "Banana, prata, in natura, Brasil",
    "source": {
      "provider": "TBCA",
      "code": "BRC0011C",
      "reference": "Banana, prata, in natura, Brasil",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "maca",
    "name": "Maçã",
    "kcal": 56,
    "p": 0.3,
    "c": 15.2,
    "f": 0.2,
    "fiber": 2.1,
    "state": "cru",
    "role": "fruit",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "ceia"
    ],
    "satiety": 4,
    "pre": 3,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "mamao",
    "name": "Mamão",
    "kcal": 40,
    "p": 0.5,
    "c": 10.4,
    "f": 0.1,
    "fiber": 1,
    "state": "cru",
    "role": "fruit",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "breakfast",
      "snack",
      "ceia"
    ],
    "satiety": 3,
    "pre": 3,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "batata",
    "name": "Batata inglesa sem casca, cozida e drenada, sem óleo/sal",
    "kcal": 52,
    "p": 1.33,
    "c": 12.3,
    "f": 0.05,
    "fiber": 1.47,
    "state": "cozido",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "pre",
      "post"
    ],
    "satiety": 5,
    "pre": 4,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRC0041B",
    "ref": "Batata, inglesa, s/ casca, cozida, drenada, s/ óleo, s/ sal, Brasil",
    "source": {
      "provider": "TBCA",
      "code": "BRC0041B",
      "reference": "Batata, inglesa, s/ casca, cozida, drenada, s/ óleo, s/ sal, Brasil",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "batata_doce",
    "name": "Batata-doce cozida",
    "kcal": 77,
    "p": 0.6,
    "c": 18.4,
    "f": 0.1,
    "fiber": 2.2,
    "state": "cozido",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "pre",
      "post"
    ],
    "satiety": 5,
    "pre": 4,
    "post": 5,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "mandioca",
    "name": "Mandioca cozida",
    "kcal": 125,
    "p": 0.6,
    "c": 30.1,
    "f": 0.3,
    "fiber": 1.6,
    "state": "cozido",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 4,
    "pre": 3,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "macarrao",
    "name": "Macarrão de trigo refinado, cozido, sem óleo/sal",
    "kcal": 161,
    "p": 4.57,
    "c": 34.7,
    "f": 0.74,
    "fiber": 1.17,
    "state": "cozido",
    "role": "carb",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 3,
    "pre": 3,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "provider": "TBCA",
    "code": "BRD0006A",
    "ref": "Macarrão, c/ farinha de trigo refinada, cozido, s/ óleo, s/ sal, Brasil",
    "source": {
      "provider": "TBCA",
      "code": "BRD0006A",
      "reference": "Macarrão, c/ farinha de trigo refinada, cozido, s/ óleo, s/ sal, Brasil",
      "status": "direct-verified",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "azeite",
    "name": "Azeite de oliva (salada/preparo)",
    "kcal": 884,
    "p": 0,
    "c": 0,
    "f": 100,
    "fiber": 0,
    "state": "líquido",
    "role": "fat",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 2,
    "slots": [
      "lunch",
      "dinner"
    ],
    "satiety": 1,
    "pre": 1,
    "post": 1,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "abacate",
    "name": "Abacate",
    "kcal": 96,
    "p": 1.2,
    "c": 6,
    "f": 8.4,
    "fiber": 6.3,
    "state": "cru",
    "role": "fat",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 2,
    "slots": [
      "breakfast",
      "snack",
      "lunch",
      "dinner",
      "ceia"
    ],
    "satiety": 5,
    "pre": 1,
    "post": 2,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "pasta_amendoim",
    "name": "Pasta de amendoim",
    "kcal": 588,
    "p": 25,
    "c": 20,
    "f": 50,
    "fiber": 6,
    "state": "pronto",
    "role": "fat",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 2,
    "slots": [
      "breakfast",
      "snack",
      "ceia"
    ],
    "satiety": 4,
    "pre": 1,
    "post": 2,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "USDA_FDC",
      "reference": "USDA FoodData Central — alimento genérico equivalente",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "brocolis",
    "name": "Brócolis cozido",
    "kcal": 25,
    "p": 2.1,
    "c": 4.4,
    "f": 0.4,
    "fiber": 3.4,
    "state": "cozido",
    "role": "veg",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 2,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 5,
    "pre": 1,
    "post": 2,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "cenoura",
    "name": "Cenoura cozida",
    "kcal": 30,
    "p": 0.8,
    "c": 6.7,
    "f": 0.2,
    "fiber": 2.6,
    "state": "cozido",
    "role": "veg",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 4,
    "pre": 1,
    "post": 2,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "tomate",
    "name": "Tomate",
    "kcal": 18,
    "p": 0.9,
    "c": 3.9,
    "f": 0.2,
    "fiber": 1.2,
    "state": "cru",
    "role": "veg",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner"
    ],
    "satiety": 3,
    "pre": 1,
    "post": 2,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "alface",
    "name": "Alface",
    "kcal": 15,
    "p": 1.4,
    "c": 2.9,
    "f": 0.2,
    "fiber": 1.3,
    "state": "cru",
    "role": "veg",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner"
    ],
    "satiety": 3,
    "pre": 1,
    "post": 1,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "lentilha",
    "name": "Lentilha cozida",
    "kcal": 93,
    "p": 6.3,
    "c": 16.3,
    "f": 0.5,
    "fiber": 7.9,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 5,
    "pre": 1,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "grao_bico",
    "name": "Grão-de-bico cozido",
    "kcal": 164,
    "p": 8.9,
    "c": 27.4,
    "f": 2.6,
    "fiber": 7.6,
    "state": "cozido",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 2,
    "slots": [
      "lunch",
      "dinner"
    ],
    "satiety": 5,
    "pre": 1,
    "post": 3,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "tofu",
    "name": "Tofu firme",
    "kcal": 92,
    "p": 10.1,
    "c": 2.3,
    "f": 5.3,
    "fiber": 1,
    "state": "pronto",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 2,
    "slots": [
      "breakfast",
      "snack",
      "pre",
      "post",
      "lunch",
      "dinner",
      "ceia"
    ],
    "satiety": 4,
    "pre": 2,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "USDA_FDC",
      "reference": "USDA FoodData Central — alimento genérico equivalente",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "pts",
    "name": "Proteína texturizada de soja",
    "kcal": 330,
    "p": 50,
    "c": 30,
    "f": 1,
    "fiber": 14,
    "state": "seco",
    "role": "protein",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 1,
    "slots": [
      "lunch",
      "dinner",
      "post"
    ],
    "satiety": 5,
    "pre": 1,
    "post": 4,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "TACO",
      "reference": "Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  },
  {
    "id": "castanhas",
    "name": "Castanhas",
    "kcal": 607,
    "p": 20,
    "c": 21,
    "f": 54,
    "fiber": 7,
    "state": "pronto",
    "role": "fat",
    "diets": [
      "omnivore",
      "vegetarian",
      "vegan"
    ],
    "budget": 3,
    "slots": [
      "snack",
      "ceia"
    ],
    "satiety": 4,
    "pre": 1,
    "post": 1,
    "basis": "100g_parte_comestivel",
    "catalogVersion": "2026.09.22-v1",
    "source": {
      "provider": "USDA_FDC",
      "reference": "USDA FoodData Central — alimento genérico equivalente",
      "status": "reference-mapped",
      "verifiedAt": "2026-09-22"
    }
  }
];

export const FOOD_MAP = Object.fromEntries(FOODS.map(f => [f.id, f]));

export function nutrients(foodId, grams) {
 const f=FOOD_MAP[foodId]; if(!f) throw new Error(`Alimento não encontrado: ${foodId}`); const g=Number(grams); if(!Number.isFinite(g)||g<0) throw new Error(`Quantidade inválida para ${foodId}`); const k=g/100; return {kcal:f.kcal*k,p:f.p*k,c:f.c*k,f:f.f*k,fiber:f.fiber*k};
}

export function sourceLabel(foodOrId){ const f=typeof foodOrId==='string'?FOOD_MAP[foodOrId]:foodOrId; if(!f)return 'Fonte não identificada'; return f.source.provider==='LABEL'?'Rótulo da marca':f.source.provider==='USDA_FDC'?'USDA FDC':f.source.provider==='TACO'?'TACO 4ª ed.':f.source.provider==='TBCA'?'TBCA':'Base curada'; }

export function validateFoodCatalog(){ const issues=[],ids=new Set(); for(const f of FOODS){ if(!f.id||ids.has(f.id))issues.push(`ID inválido/duplicado: ${f.id}`); ids.add(f.id); for(const k of ['kcal','p','c','f','fiber'])if(!Number.isFinite(f[k])||f[k]<0)issues.push(`${f.id}: ${k} inválido`); if(!f.name||!f.state||!f.role)issues.push(`${f.id}: metadados culinários incompletos`); if(!Array.isArray(f.slots)||!f.slots.length)issues.push(`${f.id}: slots ausentes`); if(!f.source?.provider||!DATA_SOURCES[f.source.provider])issues.push(`${f.id}: fonte inválida`); if(!f.source?.reference)issues.push(`${f.id}: referência ausente`); if(f.source.provider==='LABEL'&&!f.requiresLabelConfirmation)issues.push(`${f.id}: item variável sem confirmação de rótulo`); const mk=f.p*4+f.c*4+f.f*9; if(f.kcal>0&&Math.abs(mk-f.kcal)/f.kcal>0.30)issues.push(`${f.id}: energia/macros fora da tolerância`); } return {ok:!issues.length,issues,count:FOODS.length,version:CATALOG_INFO.version}; }

export function excludedFoodIds(profile={}) { const out=new Set(profile.dislikes||[]); const text=String(profile.restrictions||'').toLowerCase(); const add=ids=>ids.forEach(id=>out.add(id)); if(/lactose|leite|lácte|lacteo|lácteo/.test(text))add(['leite','iogurte','queijo','whey']); if(/gl[uú]ten|trigo|cel[ií]ac/.test(text))add(['pao','macarrao','aveia']); if(/\bovo\b|ovos/.test(text))add(['ovo','clara_ovo']); if(/soja/.test(text))add(['tofu','pts']); if(/peixe|pescado/.test(text))add(['tilapia','sardinha']); if(/amendoim|castanha|nozes|nuts/.test(text))add(['pasta_amendoim','castanhas']); return out; }
