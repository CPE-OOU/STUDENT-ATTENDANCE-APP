import { UniversityItem, universities } from './db';

type UniversityCategory = UniversityItem['type'] | 'Public';

export function getUniversities(category?: UniversityCategory) {
  if (category) {
    if (typeof category != 'string') {
      throw new Error('IllegalArgumentException - Category must be a string');
    }
  }

  if (category == undefined) {
    return JSON.stringify(universities);
  } else if (category == 'Federal') {
    return JSON.stringify(
      universities.filter(function (item) {
        return item.type == 'Federal';
      })
    );
  } else if (category == 'State') {
    return JSON.stringify(
      universities.filter(function (item) {
        return item.type == 'State';
      })
    );
  } else if (category == 'Private') {
    return JSON.stringify(
      universities.filter(function (item) {
        return item.type == 'Private';
      })
    );
  } else if (category == 'Public') {
    return JSON.stringify(
      universities.filter(function (item) {
        return item.type == 'State' || item.type == 'Federal';
      })
    );
  } else {
    return {};
  }
}
