import assert from 'node:assert/strict';
import { test } from 'node:test';
import { animalMedicineSellerLocationPrecision, parseAnimalMedicineSellerAddress, parseAnimalMedicineSellerBusinessRegistrationNumber, parseAnimalMedicineSellerLicenseNumber, parseAnimalMedicineSellerPhone } from './licensedAnimalMedicineSellers';

test('parses animal medicine seller license, address, registration, and phone conservatively', () => {
  assert.deepEqual(parseAnimalMedicineSellerLicenseNumber(' 北市動藥販字0001 ').sellerLicenseNumberSequence, 1);
  assert.equal(parseAnimalMedicineSellerBusinessRegistrationNumber('00123456').businessRegistrationNumberNormalized, '00123456');
  assert.equal(parseAnimalMedicineSellerBusinessRegistrationNumber('00123456').validFormat, true);
  const address = parseAnimalMedicineSellerAddress('台北巿中正區仁愛路1段4號2樓之3');
  assert.equal(address.districtNameFromAddress, '中正區');
  assert.equal(address.roadName, '仁愛路1段');
  assert.equal(address.addressUsesOldTaipeiText, true);
  assert.equal(address.addressLooksLikeMultiFloorOrUnit, true);
  assert.equal(animalMedicineSellerLocationPrecision(address), 'district_address');
  assert.equal(parseAnimalMedicineSellerPhone('23948802-3').companyPhoneNormalized, '23948802-3');
});
