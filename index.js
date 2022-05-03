var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var config = {
    REGIONAL_BLOCS: ['EU', 'NAFTA', 'AU', 'other'],
    API_URL: "https://restcountries.com/v2/all",
    LANG_KEY: "iso639_1"
};
var createObj = function (organizations) {
    var object = {};
    organizations.forEach(function (organization) {
        object[organization] = {
            countries: [],
            population: 0,
            languages: {},
            currencies: []
        };
    });
    return object;
};
var countriesInOrganizations = createObj(config.REGIONAL_BLOCS);
var fillObj = function (fetchResponse) {
    fetchResponse.forEach(function (country) {
        if (!country.regionalBlocs) {
            pushCountriesToObj(country, 'other');
            return;
        }
        country.regionalBlocs.forEach(function (bloc) {
            if (validateByOrganization(bloc.acronym)) {
                pushCountriesToObj(country, bloc.acronym);
            }
        });
    });
};
var pushCountriesToObj = function (country, organization) {
    var organizationToFill = countriesInOrganizations[organization];
    organizationToFill.countries.push(country.nativeName);
    organizationToFill.population += country.population;
    organizationToFill.currencies = checkCurrencies(country, organization);
    organizationToFill.languages = checkLanguages(country, organization);
};
var validateByOrganization = function (organization) {
    return ['EU', 'NAFTA', 'AU'].includes(organization);
};
var checkLanguages = function (country, organization) {
    var organizationToCheck = countriesInOrganizations[organization];
    country.languages.forEach(function (currentLanguage) {
        var languageInObj = organizationToCheck.languages[currentLanguage.iso639_1];
        if (!languageInObj) {
            organizationToCheck.languages[currentLanguage.iso639_1] = {
                countries: [],
                population: 0,
                area: 0,
                name: ''
            };
        }
        var fillLanguageInObj = organizationToCheck.languages[currentLanguage.iso639_1];
        fillLanguageInObj.countries.push(country.alpha3Code);
        fillLanguageInObj.population = country.population;
        if (country.area !== undefined) {
            fillLanguageInObj.area = country.area;
        }
        fillLanguageInObj.name = currentLanguage.nativeName;
    });
    return organizationToCheck.languages;
};
var checkCurrencies = function (country, organization) {
    var organizationToCheck = countriesInOrganizations[organization];
    var currenciesNames = [];
    if (!country.currencies) {
        return organizationToCheck.currencies;
    }
    country.currencies.forEach(function (currency) {
        if (!organizationToCheck.currencies.includes(currency.name)) {
            currenciesNames.push(currency.name);
        }
    });
    return __spreadArray(__spreadArray([], organizationToCheck.currencies, true), currenciesNames, true);
};
var sortCountriesInOrg = function (obj) {
    for (var organization in obj) {
        obj[organization].countries.sort().reverse();
    }
};
var getMostPopulation = function (inputObj) {
    var populationArr = [];
    for (var el in inputObj) {
        populationArr.push(inputObj[el].population);
    }
    var biggestNumber = Math.max.apply(Math, populationArr);
    for (var el in inputObj) {
        if (inputObj[el].population === biggestNumber) {
            return el;
        }
    }
};
var getMostPopulous = function (inputObj) {
    var organisationsArea = getOrganisationsArea(inputObj, config.REGIONAL_BLOCS);
    var organizationsPopulous = organisationsArea.map(function (organization) { return [organization[0], inputObj[organization[0]].population / organization[1]]; });
    return organizationsPopulous.sort(function (a, b) { return b[1] - a[1]; });
};
var getOrganisationsArea = function (inputObj, organizations) {
    return organizations.map(function (organization) { return [organization, Object.entries(inputObj[organization].languages).reduce(function (area, item) { return item[1]['area'] + area; }, 0)]; });
};
var sortOgranizationsArea = function (inputObj) {
    var organisationsArea = getOrganisationsArea(inputObj, config.REGIONAL_BLOCS);
    return organisationsArea.sort(function (a, b) { return b[1] - a[1]; });
};
var getAmmountofNativeLanguage = function (inputObj, organizations) {
    var langAmmout = organizations.map(function (organization) { return [organization, Object.keys(inputObj[organization].languages).length]; });
    return langAmmout.sort(function (a, b) { return b[1] - a[1]; });
};
var getCurrencies = function (inputObj, organizations) {
    var currencyAmmout = organizations.map(function (organization) { return [organization, inputObj[organization].currencies.length]; });
    return currencyAmmout.sort(function (a, b) { return b[1] - a[1]; });
};
var getCountries = function (inputObj, organizations) {
    var countriesAmmout = organizations.map(function (organization) { return [organization, inputObj[organization].countries.length]; });
    return countriesAmmout.sort(function (a, b) { return b[1] - a[1]; });
};
var getNativeNamebyCountries = function (inputObj) {
    var output = {};
    for (var organization in inputObj) {
        for (var language in inputObj[organization].languages) {
            if (!output[inputObj[organization].languages[language].name]) {
                output[inputObj[organization].languages[language].name] = 0;
            }
            output[inputObj[organization].languages[language].name] += inputObj[organization].languages[language].countries.length;
        }
    }
    var languages = Object.entries(output);
    return languages.sort(function (a, b) { return b[1] - a[1]; });
};
var getNativeNamebyPopulation = function (inputObj) {
    var output = {};
    for (var organization in inputObj) {
        for (var language in inputObj[organization].languages) {
            if (!output[inputObj[organization].languages[language].name]) {
                output[inputObj[organization].languages[language].name] = 0;
            }
            output[inputObj[organization].languages[language].name] += inputObj[organization].languages[language].population;
        }
    }
    var languages = Object.entries(output);
    return languages.sort(function (a, b) { return a[1] - b[1]; });
};
var getNativeNamebyArea = function (inputObj) {
    var output = {};
    for (var organization in inputObj) {
        for (var language in inputObj[organization].languages) {
            if (!output[inputObj[organization].languages[language].name]) {
                output[inputObj[organization].languages[language].name] = 0;
            }
            output[inputObj[organization].languages[language].name] += inputObj[organization].languages[language].area;
        }
    }
    var languages = Object.entries(output);
    languages.sort(function (a, b) { return b[1] - a[1]; });
    return [languages[0][0], languages[languages.length - 1][0]];
};
var main = function () {
    fetch(config.API_URL)
        .then(function (response) { return response.json(); })
        .then(function (response) {
        fillObj(response);
        sortCountriesInOrg(countriesInOrganizations);
        console.log("Organization with the biggest population: ".concat(getMostPopulation(countriesInOrganizations)));
        console.log("Organization with the second biggest populous: ".concat(getMostPopulous(countriesInOrganizations)[1][0]));
        console.log("Organization with the third biggest area: ".concat(sortOgranizationsArea(countriesInOrganizations)[2][0]));
        console.log("Organization with the biggest and lowest number of used languages: ".concat(getAmmountofNativeLanguage(countriesInOrganizations, config.REGIONAL_BLOCS)[0][0], ", ").concat(getAmmountofNativeLanguage(countriesInOrganizations, config.REGIONAL_BLOCS)[3][0]));
        console.log("Organization using most currencies: ".concat(getCurrencies(countriesInOrganizations, config.REGIONAL_BLOCS)[0][0]));
        console.log("Organization having least coutries as members: ".concat(getCountries(countriesInOrganizations, config.REGIONAL_BLOCS)[3][0]));
        console.log("Native language used the most (by amount of countries using it): ".concat(getNativeNamebyCountries(countriesInOrganizations)[0][0]));
        console.log("Native language used the least (by amount of people using it): ".concat(getNativeNamebyPopulation(countriesInOrganizations)[0][0]));
        console.log("Native language used at the widest and narrowest area: ".concat(getNativeNamebyArea(countriesInOrganizations)));
        console.log(getOrganisationsArea(countriesInOrganizations, config.REGIONAL_BLOCS));
        console.log(getAmmountofNativeLanguage(countriesInOrganizations, config.REGIONAL_BLOCS));
        console.log(countriesInOrganizations);
    });
};
main();
