type OrganizationsKeys = {
  EU: OrganizationsKeysValues;
  NAFTA: OrganizationsKeysValues;
  AU: OrganizationsKeysValues;
  other: OrganizationsKeysValues;
};

type OrganizationsKeysValues = {
  countries: string[];
  population: number;
  languages: {};
  currencies: string[];
};

type FetchData = {
  name: string;
  population: number;
  regionalBlocs?: { acronym: string }[];
  area: number;
  nativeName?: string;
  currencies?: { name: string }[];
  languages?: { iso639_1: string; nativeName: string }[];
  alpha3Code?: string;
};

const config = {
  REGIONAL_BLOCS: ['EU', 'NAFTA', 'AU', 'other'],
  API_URL: `https://restcountries.com/v2/all`,
  LANG_KEY: `iso639_1`,
};

const createObj = (organizations: string[]): OrganizationsKeys | {} => {
  let object: OrganizationsKeys | {} = {};
  organizations.forEach((organization) => {
    object[organization] = {
      countries: [],
      population: 0,
      languages: {},
      currencies: [],
    };
  });
  return object;
};

const countriesInOrganizations: OrganizationsKeys | {} = createObj(config.REGIONAL_BLOCS);

const fillObj = (fetchResponse: FetchData[]): void => {
  fetchResponse.forEach((country) => {
    if (!country.regionalBlocs) {
      pushCountriesToObj(country, 'other');
      return;
    }
    country.regionalBlocs.forEach((bloc) => {
      if (validateByOrganization(bloc.acronym)) {
        pushCountriesToObj(country, bloc.acronym);
      }
    });
  });
};

const pushCountriesToObj = (country: FetchData, organization: string) => {
  const organizationToFill = countriesInOrganizations[organization];
  organizationToFill.countries.push(country.nativeName);
  organizationToFill.population += country.population;
  organizationToFill.currencies = checkCurrencies(country, organization);
  organizationToFill.languages = checkLanguages(country, organization);
};

const validateByOrganization = (organization: string): boolean => {
  return ['EU', 'NAFTA', 'AU'].includes(organization);
};

const checkLanguages = (country: FetchData, organization: string): string[] => {
  const organizationToCheck = countriesInOrganizations[organization];
  country.languages.forEach((currentLanguage) => {
    let languageInObj = organizationToCheck.languages[currentLanguage.iso639_1];
    if (!languageInObj) {
      organizationToCheck.languages[currentLanguage.iso639_1] = {
        countries: [],
        population: 0,
        area: 0,
        name: '',
      };
    }
    let fillLanguageInObj = organizationToCheck.languages[currentLanguage.iso639_1];
    fillLanguageInObj.countries.push(country.alpha3Code);
    fillLanguageInObj.population = country.population;
    if (country.area !== undefined) {
      fillLanguageInObj.area = country.area;
    }
    fillLanguageInObj.name = currentLanguage.nativeName;
  });
  return organizationToCheck.languages;
};

const checkCurrencies = (country: FetchData, organization: string) => {
  const organizationToCheck = countriesInOrganizations[organization];
  let currenciesNames: string[] = [];
  if (!country.currencies) {
    return organizationToCheck.currencies;
  }
  country.currencies.forEach((currency) => {
    if (!organizationToCheck.currencies.includes(currency.name)) {
      currenciesNames.push(currency.name);
    }
  });
  return [...organizationToCheck.currencies, ...currenciesNames];
};

const sortCountriesInOrg = (obj: OrganizationsKeys | {}) => {
  for (let organization in obj) {
    obj[organization].countries.sort().reverse();
  }
};

const getMostPopulation = (inputObj: OrganizationsKeys | {}) => {
  let populationArr: number[] = [];
  for (let el in inputObj) {
    populationArr.push(inputObj[el].population);
  }
  let biggestNumber = Math.max(...populationArr);
  for (let el in inputObj) {
    if (inputObj[el].population === biggestNumber) {
      return el;
    }
  }
};

const getMostPopulous = (inputObj: OrganizationsKeys | {}) => {
  const organisationsArea = getOrganisationsArea(inputObj, config.REGIONAL_BLOCS);
  const organizationsPopulous: [string, number][] = organisationsArea.map((organization) => [organization[0], inputObj[organization[0]].population / organization[1]]);
  return organizationsPopulous.sort((a, b) => b[1] - a[1]);
};

const getOrganisationsArea = (inputObj: OrganizationsKeys | {}, organizations: string[]) => {
  return organizations.map((organization) => [organization, Object.entries(inputObj[organization].languages).reduce((area, item) => item[1]['area'] + area, 0)]);
};

const sortOgranizationsArea = (inputObj: OrganizationsKeys | {}) => {
  const organisationsArea = getOrganisationsArea(inputObj, config.REGIONAL_BLOCS);
  return organisationsArea.sort((a, b) => b[1] - a[1]);
};

const getAmmountofNativeLanguage = (inputObj: OrganizationsKeys | {}, organizations: string[]) => {
  const langAmmout: [string, number][] = organizations.map((organization) => [organization, Object.keys(inputObj[organization].languages).length]);
  return langAmmout.sort((a, b) => b[1] - a[1]);
};

const getCurrencies = (inputObj: OrganizationsKeys | {}, organizations: string[]) => {
  const currencyAmmout: [string, number][] = organizations.map((organization) => [organization, inputObj[organization].currencies.length]);
  return currencyAmmout.sort((a, b) => b[1] - a[1]);
};

const getCountries = (inputObj: OrganizationsKeys | {}, organizations: string[]) => {
  const countriesAmmout: [string, number][] = organizations.map((organization) => [organization, inputObj[organization].countries.length]);
  return countriesAmmout.sort((a, b) => b[1] - a[1]);
};

const getNativeNamebyCountries = (inputObj: OrganizationsKeys | {}) => {
  let output = {};
  for (let organization in inputObj) {
    for (let language in inputObj[organization].languages) {
      if (!output[inputObj[organization].languages[language].name]) {
        output[inputObj[organization].languages[language].name] = 0;
      }
      output[inputObj[organization].languages[language].name] += inputObj[organization].languages[language].countries.length;
    }
  }
  const languages: [string, number][] = Object.entries(output);
  return languages.sort((a, b) => b[1] - a[1]);
};

const getNativeNamebyPopulation = (inputObj: OrganizationsKeys | {}) => {
  let output = {};
  for (let organization in inputObj) {
    for (let language in inputObj[organization].languages) {
      if (!output[inputObj[organization].languages[language].name]) {
        output[inputObj[organization].languages[language].name] = 0;
      }
      output[inputObj[organization].languages[language].name] += inputObj[organization].languages[language].population;
    }
  }
  const languages: [string, number][] = Object.entries(output);
  return languages.sort((a, b) => a[1] - b[1]);
};

const getNativeNamebyArea = (inputObj: OrganizationsKeys | {}) => {
  let output = {};
  for (let organization in inputObj) {
    for (let language in inputObj[organization].languages) {
      if (!output[inputObj[organization].languages[language].name]) {
        output[inputObj[organization].languages[language].name] = 0;
      }
      output[inputObj[organization].languages[language].name] += inputObj[organization].languages[language].area;
    }
  }
  const languages: [string, number][] = Object.entries(output);
  languages.sort((a, b) => b[1] - a[1]);
  return [languages[0][0], languages[languages.length - 1][0]];
};

const main = () => {
  fetch(config.API_URL)
    .then((response) => response.json())
    .then((response) => {
      fillObj(response);
      sortCountriesInOrg(countriesInOrganizations);
      console.log(`Organization with the biggest population: ${getMostPopulation(countriesInOrganizations)}`);
      console.log(`Organization with the second biggest populous: ${getMostPopulous(countriesInOrganizations)[1][0]}`);
      console.log(`Organization with the third biggest area: ${sortOgranizationsArea(countriesInOrganizations)[2][0]}`);
      console.log(
        `Organization with the biggest and lowest number of used languages: ${getAmmountofNativeLanguage(countriesInOrganizations, config.REGIONAL_BLOCS)[0][0]}, ${
          getAmmountofNativeLanguage(countriesInOrganizations, config.REGIONAL_BLOCS)[3][0]
        }`
      );
      console.log(`Organization using most currencies: ${getCurrencies(countriesInOrganizations, config.REGIONAL_BLOCS)[0][0]}`);
      console.log(`Organization having least coutries as members: ${getCountries(countriesInOrganizations, config.REGIONAL_BLOCS)[3][0]}`);
      console.log(`Native language used the most (by amount of countries using it): ${getNativeNamebyCountries(countriesInOrganizations)[0][0]}`);
      console.log(`Native language used the least (by amount of people using it): ${getNativeNamebyPopulation(countriesInOrganizations)[0][0]}`);
      console.log(`Native language used at the widest and narrowest area: ${getNativeNamebyArea(countriesInOrganizations)}`);
      console.log(getOrganisationsArea(countriesInOrganizations, config.REGIONAL_BLOCS));
      console.log(getAmmountofNativeLanguage(countriesInOrganizations, config.REGIONAL_BLOCS));
      console.log(countriesInOrganizations);
    });
};

main();
