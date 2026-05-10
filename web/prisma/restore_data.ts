const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting data restoration...");

  // 1. License Plans
  console.log("📦 Restoring License Plans...");
  const plans = [
    { id: 'cmotfucbk0000v9gasvm6v5by', name: 'Standard', type: 'MONTHLY', basePrice: 1500, salePrice: 1000, isSaleActive: true, status: 'ACTIVE', isDefault: true },
    { id: 'cmotfucc10001v9gaychcsrcp', name: 'Pro Basic', type: 'MONTHLY', basePrice: 7500, salePrice: 5000, isSaleActive: true, status: 'ACTIVE' },
    { id: 'cmotfucc40002v9gabxm8bn4q', name: 'PRO ADVANCE', type: 'MONTHLY', basePrice: 10000, salePrice: 8000, isSaleActive: true, status: 'ACTIVE' },
    { id: 'cmotgv1ug0001v9czz661682n', name: 'PRO ADVANCE yearly', type: 'ANNUALLY', basePrice: 120000, salePrice: 96000, isSaleActive: true, status: 'ACTIVE' },
  ];

  for (const p of plans) {
    await prisma.licensePlan.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }

  // 2. Geographic Hierarchy
  console.log("🌍 Restoring Geographic Hierarchy...");
  const country = await prisma.masterCountry.upsert({
    where: { id: 'cmop7f3f30004v9rjw4eimfwj' },
    update: {},
    create: { id: 'cmop7f3f30004v9rjw4eimfwj', name: 'Sri Lanka', code: 'LK', currency: 'RS', currencyDecimalPlaces: 2 }
  });

  const province = await prisma.masterProvince.upsert({
    where: { id: 'cmop7fbig0006v9rjzbdnqm27' },
    update: {},
    create: { id: 'cmop7fbig0006v9rjzbdnqm27', name: 'Central', countryId: country.id }
  });

  const district = await prisma.masterDistrict.upsert({
    where: { id: 'cmop7ficb0008v9rjfrvkfoed' },
    update: {},
    create: { id: 'cmop7ficb0008v9rjfrvkfoed', name: 'Matale', provinceId: province.id }
  });

  // Create a default Divisional Secretariat for existing data
  const divSec = await prisma.masterDivisionalSecretariat.upsert({
    where: { name_districtId: { name: 'Matale DS', districtId: district.id } },
    update: {},
    create: { name: 'Matale DS', districtId: district.id }
  });

  // 3. Master Areas
  console.log("📍 Restoring Master Areas...");
  const areas = [
    { id: 'cmop7fuk7000av9rj8w2ibugj', name: 'Warakamura' },
    { id: 'cmoqs7zo90001v9smqkew1d4u', name: 'Mattawa' },
    { id: 'cmoqs850q0003v9smnd0o38cy', name: 'Warakanda' },
    { id: 'cmoqs8b690005v9sm8ml34cd1', name: 'Huda' },
    { id: 'cmoqs8gfw0007v9smpf4mr8jg', name: 'Meedeniya' },
    { id: 'cmoqs8o0y0009v9smix12rloz', name: 'Hijra' },
    { id: 'cmoqs9jg9000bv9sm7gh8yang', name: 'Porcelain Watta' },
    { id: 'cmoqsa926000dv9smjw105lw4', name: 'Samoon Mawatha Junction' },
    { id: 'cmoqsap7b000fv9smkd843y2d', name: 'Ukuwelawatta' },
    { id: 'cmoscpdm60001v9217581imzr', name: 'Matale' },
  ];

  for (const a of areas) {
    await prisma.masterArea.upsert({
      where: { id: a.id },
      update: { divisionalSecretariatId: divSec.id },
      create: { ...a, divisionalSecretariatId: divSec.id }
    });
  }

  // 4. Main Mahallas
  console.log("🏛️ Restoring Main Mahallas...");
  const mahallas = [
    { id: 'cmop75hs00000v9x1e5k34ycn', name: 'Colombo Central Mahalla', address: 'Colombo, Sri Lanka', status: 'INACTIVE', defaultCurrency: 'LKR' },
    { id: 'cmotjo0b00006v9qckbi8fxde', name: 'KKK Main Mahalla', email: 'zetatutorhub@gmail.com', address: '555500, Ukuwela', country: 'Sri Lanka', province: 'Central', district: 'Matale', area: 'Matale', status: 'ACTIVE', phone: '98348938943', licensePlanId: 'cmotfucbk0000v9gasvm6v5by', logo: '/uploads/main-mahallas/1778043030775-KKK.png' },
    { id: 'cmosbqk4p0000v92vja0jpt24', name: 'MNM Main Mahalla', email: 'zetatutoronline@gmail.com', address: 'No 68, Ukuwela', country: 'Sri Lanka', province: 'Central', district: 'Matale', area: 'Matale', status: 'ACTIVE', phone: '0768242424', licensePlanId: 'cmotfucbk0000v9gasvm6v5by' },
    { id: 'cmop7ehze0001v9rjwpytuz1w', name: 'WM Jumma Masjid', email: 'reyaas240@gmail.com', address: 'No 6054543,Warakamura', country: 'Sri Lanka', province: 'Central', district: 'Matale', area: 'Warakamura', status: 'ACTIVE', phone: '+96892800119', licensePlanId: 'cmotfucc10001v9gaychcsrcp', logo: '/uploads/main-mahallas/1777885339697-wjm.png', coverImage: '/uploads/main-mahallas/1777885339699-wjm.png' },
    { id: 'cmotsm19z0000v9wqw22k7hx1', name: 'Test Mahalla 1778055961756', status: 'ACTIVE', defaultCurrency: 'LKR' },
    { id: 'cmott3w84000bv982gjm9ym5l', name: 'WJM Jumma Masjid', email: 'reyaas240@gmail.com', address: '849332,Warakamura', country: 'Sri Lanka', province: 'Central', district: 'Matale', status: 'ACTIVE', phone: '9893432432', licensePlanId: 'cmotfucc40002v9gabxm8bn4q', logo: '/uploads/main-mahallas/1778058585151-wjm.png', coverImage: '/uploads/main-mahallas/1778058585156-wjm.png' },
  ];

  for (const m of mahallas) {
    await prisma.mainMahalla.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }

  // 5. Sub Mahallas
  console.log("🏘️ Restoring Sub Mahallas...");
  const subMahallas = [
    { id: 'cmop7zvjd0002v98ufdistw46', name: 'Slave Island North', mainMahallaId: 'cmop75hs00000v9x1e5k34ycn', status: 'ACTIVE' },
    { id: 'cmop7zvjl0004v98uyop108g5', name: 'Kollupitiya East', mainMahallaId: 'cmop75hs00000v9x1e5k34ycn', status: 'ACTIVE' },
    { id: 'cmostt0v2000bv921p080uzp4', name: 'MNM Sub mahalla 1', mainMahallaId: 'cmosbqk4p0000v92vja0jpt24', area: 'Matale', status: 'ACTIVE', email: 'mnmsub1@mail.com' },
    { id: 'cmotk04br0001v9vsa3lsqm4h', name: 'KKK Sub Mahalla 1', mainMahallaId: 'cmotjo0b00006v9qckbi8fxde', area: 'Matale', status: 'ACTIVE', logo: '/uploads/sub-mahallas/1778043056323-KKK.png' },
    { id: 'cmoqxa6pb000ov9smnmad6fan', name: 'muhaideen masjid', mainMahallaId: 'cmott3w84000bv982gjm9ym5l', area: 'Mattawa', status: 'ACTIVE', logo: '/uploads/sub-mahallas/1777883894983-muhaideen.png', coverImage: '/uploads/sub-mahallas/1777884155435-muhaideen.png' },
    { id: 'cmop7gnbg000cv9rj9cafk3ob', name: 'WJM Masjid Mahalla', mainMahallaId: 'cmott3w84000bv982gjm9ym5l', area: 'Warakamura', status: 'ACTIVE', logo: '/uploads/sub-mahallas/1777883885788-wjm.png', coverImage: '/uploads/sub-mahallas/1777884144601-wjm.png' },
    { id: 'cmoqxa7tp000qv9sm7ry42ppm', name: 'Seeni Appa Thaikiya', mainMahallaId: 'cmott3w84000bv982gjm9ym5l', area: 'Samoon Mawatha Junction', status: 'ACTIVE', logo: '/uploads/sub-mahallas/1777883902682-seeniappa.png', coverImage: '/uploads/sub-mahallas/1777884162873-seeniappa.png' },
  ];

  for (const sm of subMahallas) {
    // Note: one ID in dump was slightly different due to character limit/copy, 
    // but I'll use the IDs exactly as found in the dump.
    await prisma.subMahalla.upsert({
      where: { id: sm.id },
      update: sm,
      create: sm
    });
  }

  // 6. Users
  console.log("👤 Restoring Users...");
  const users = [
    { id: 'cmosbqk510002v92voqdod3c0', name: 'Rey', email: 'zetatutoronline@gmail.com', password: '$2b$10$T4KwwiCyHGI9.FujRZtIK.9mreKNl6aL4RK5.l2Ad2eTm00h0XefG', role: 'MAIN_ADMIN', mainMahallaId: 'cmosbqk4p0000v92vja0jpt24' },
    { id: 'cmotjo0cl000av9qcj6boldbc', name: 'KKK', email: 'zetatutorhub@gmail.com', password: '$2b$10$.xlBOaRLwU/7P6QZpI9.6.dNA1xukBGRVz8d.CLpjTrv3N0E3hDBm', role: 'MAIN_ADMIN', mainMahallaId: 'cmotjo0b00006v9qckbi8fxde' },
    { id: 'cmott3w8w000fv982lq6d872r', name: 'wmadmin', email: 'reyaas240@gmail.com', password: '$2b$10$RNDaUJoxih3dFRwD7laSze/Na1H9Limoe7WOL7QTvNcWGJrZzqDj.', role: 'MAIN_ADMIN', mainMahallaId: 'cmott3w84000bv982gjm9ym5l' },
    { id: 'cmop7j0y0000ev9rj25s4zr8k', name: 'WJ Sub Admin', email: 'wjsa@mail.com', password: '$2b$10$FnSnY8Rp87QQF4nlb6/eo.0Z4pe0F0.OtyF/7596DgZxqKYAeRy/C', role: 'SUB_ADMIN', mainMahallaId: 'cmott3w84000bv982gjm9ym5l', subMahallaId: 'cmop7gnbg000cv9rj9cafk3ob' },
    { id: 'cmoqxs62r000sv9sm7lpxhnmp', name: 'Muhaideen', email: 'muhaideen@mail.com', password: '$2b$10$UTL27479l30l6R7O0GSYZO4YKOm2elC.x1ziqN3ic0nqj2ofOFpO6', role: 'SUB_ADMIN', mainMahallaId: 'cmott3w84000bv982gjm9ym5l', subMahallaId: 'cmoqxa6pb000ov9smnmad6fan' },
    { id: 'cmop75hs80002v9x1vjqe62uk', name: 'Platform Admin', email: 'admin@mahallasplus.com', password: '$2b$10$TWztMZimnbHbN4o9sQ9yeeZLRyp3VIEtfQB0x7TFK5Ggwz3qr4RBy', role: 'PLATFORM_ADMIN', mainMahallaId: 'cmop75hs00000v9x1e5k34ycn' },
    { id: 'cmop7ei2o0003v9rje3menhyy', name: 'Reyaas', email: 'reyaas240old@gmail.com', password: '$2b$10$.xlBOaRLwU/7P6QZpI9.6.dNA1xukBGRVz8d.CLpjTrv3N0E3hDBm', role: 'MAIN_ADMIN', mainMahallaId: 'cmop7ehze0001v9rjwpytuz1w' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u
    });
  }

  // 7. System Settings
  console.log("⚙️ Restoring System Settings...");
  await prisma.systemSettings.upsert({
    where: { id: 'global' },
    update: {
      smtpHost: 'mail.crestfield.edu.lk',
      smtpPort: 587,
      smtpUser: 'hr@crestfield.edu.lk',
      smtpPassword: 'Wire2010!*',
      smtpFromEmail: 'hr@crestfield.edu.lk',
      smtpEncryption: 'TLS',
      bankName: 'Commercial Bank',
      accountNumber: '19999988938924',
      accountHolder: 'Mahallas Plus Pvt Ltd',
      bankInstructions: 'Please mention your invoice number for the reference.'
    },
    create: {
      id: 'global',
      smtpHost: 'mail.crestfield.edu.lk',
      smtpPort: 587,
      smtpUser: 'hr@crestfield.edu.lk',
      smtpPassword: 'Wire2010!*',
      smtpFromEmail: 'hr@crestfield.edu.lk',
      smtpEncryption: 'TLS',
      bankName: 'Commercial Bank',
      accountNumber: '19999988938924',
      accountHolder: 'Mahallas Plus Pvt Ltd',
      bankInstructions: 'Please mention your invoice number for the reference.'
    }
  });

  // 8. Family Cards
  console.log("👪 Restoring Family Cards...");
  const families = [
    { id: 'cmopemi8g001kv9rjkj6kf3f6', mainMahallaCardNo: '101', subMahallaCardNo: '101', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmop7gnbg000cv9rj9cafk3ob' },
    { id: 'cmoqfvgwd000fv9ponydofoca', mainMahallaCardNo: '102', subMahallaCardNo: '102', livingType: 'RENTED', status: 'ACTIVE', subMahallaId: 'cmop7gnbg000cv9rj9cafk3ob' },
    { id: 'cmor5gik70003v9atp6fgc8l7', mainMahallaCardNo: '1100', subMahallaCardNo: '500', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmoqxa6pb000ov9smnmad6fan' },
    { id: 'cmor9bgjd0001v9rsp3idilva', mainMahallaCardNo: '1003', subMahallaCardNo: '1003', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmop7gnbg000cv9rj9cafk3ob', address: '64, kandy road, warakamura, ukuwela, sri lanka' },
    { id: 'cmorcia1v0005v9rsriif14ya', mainMahallaCardNo: '1300', subMahallaCardNo: '501', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmoqxa6pb000ov9smnmad6fan', address: '54, mattawa' },
    { id: 'cmopec89o0018v9rj16h9jlho', mainMahallaCardNo: '100', subMahallaCardNo: '100', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmop7gnbg000cv9rj9cafk3ob', address: '67, NNN road, Warakamura' },
    { id: 'cmos6ef0m001lv9i0ui6g82eg', mainMahallaCardNo: '1004', subMahallaCardNo: '501', livingType: 'RENTED', status: 'ACTIVE', subMahallaId: 'cmop7gnbg000cv9rj9cafk3ob', address: '90, KK Road, WM' },
    { id: 'cmos6jdlr001tv9i01g56aavv', mainMahallaCardNo: '1005', subMahallaCardNo: '503', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmop7gnbg000cv9rj9cafk3ob', address: '76, MNM Road, WM' },
    { id: 'cmostu5wy000dv921958kyd95', mainMahallaCardNo: '1300', subMahallaCardNo: '501', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmostt0v2000bv921p080uzp4', address: '187, MMMMM St, Matale' },
    { id: 'cmotkyv6c0005v9vskgkgwo5j', mainMahallaCardNo: '100', subMahallaCardNo: '100', livingType: 'OWN_HOUSE', status: 'ACTIVE', subMahallaId: 'cmotk04br0001v9vsa3lsqm4h', address: '6000, matale' },
  ];

  for (const f of families) {
    await prisma.familyCard.upsert({
      where: { id: f.id },
      update: f,
      create: f
    });
  }

  // 9. Family Members
  console.log("👥 Restoring Family Members...");
  const members = [
    { id: 'cmor9ck1v0003v9rszhal41w6', title: 'Mr.', fullName: 'Sanis', relationship: 'Head', isBreadwinner: true, occupation: 'mechanic', status: 'ACTIVE', familyCardId: 'cmor9bgjd0001v9rsp3idilva', phone: '077284842424' },
    { id: 'cmorck1ik0007v9rse7zancug', title: 'Mrs.', fullName: 'Neeka', relationship: 'Head', isBreadwinner: true, occupation: 'Daily Worker', status: 'ACTIVE', familyCardId: 'cmorcia1v0005v9rsriif14ya' },
    { id: 'cmorcl7he0009v9rsarq3v1ik', title: 'Miss.', fullName: 'Katika', relationship: 'Daughter', isStudent: true, status: 'ACTIVE', familyCardId: 'cmorcia1v0005v9rsriif14ya' },
    { id: 'cmopeipbf001gv9rj2exorjdy', title: 'Miss.', fullName: 'Jansi', relationship: 'Daughter', isStudent: true, school: 'MT/W An-Noor Muslim Maha Vidyalaya', grade: 'KG-Grade10', status: 'ACTIVE', familyCardId: 'cmopec89o0018v9rj16h9jlho' },
    { id: 'cmopehilv001ev9rjfal4v3cx', title: 'Miss.', fullName: 'Fida', relationship: 'Daughter', isStudent: true, school: 'MT/M Zahira College', grade: 'G.C.E (A/L)', status: 'ACTIVE', familyCardId: 'cmopec89o0018v9rj16h9jlho' },
    { id: 'cmos6fi0u001nv9i0pugwuqg4', title: 'Mr.', fullName: 'Maaricaar', relationship: 'Head', isBreadwinner: true, occupation: 'Electrician', status: 'ACTIVE', familyCardId: 'cmos6ef0m001lv9i0ui6g82eg' },
    { id: 'cmos6ghvz001pv9i0q2z6hxbp', title: 'Mrs.', fullName: 'Fathima Maaricaar', relationship: 'Spouse', occupation: 'Housewife', status: 'ACTIVE', familyCardId: 'cmos6ef0m001lv9i0ui6g82eg' },
    { id: 'cmopeo0ro001ov9rjodfxr2ck', title: 'Mrs.', fullName: 'Fathima Bicasi', relationship: 'Spouse', status: 'ACTIVE', familyCardId: 'cmopemi8g001kv9rjkj6kf3f6' },
    { id: 'cmos6hc2t001rv9i0gcf07c0e', title: 'Ms.', fullName: 'Jumaan', relationship: 'Son', status: 'ACTIVE', familyCardId: 'cmos6ef0m001lv9i0ui6g82eg' },
    { id: 'cmopepb9k001qv9rj3g07jgyk', title: 'Mr.', fullName: 'Bisnari', relationship: 'Son', isStudent: true, status: 'ACTIVE', familyCardId: 'cmopemi8g001kv9rjkj6kf3f6' },
    { id: 'cmopejzhd001iv9rjwor6iaux', title: 'Mr.', fullName: 'Firna', relationship: 'Son', occupation: 'Engineer', status: 'ACTIVE', familyCardId: 'cmopec89o0018v9rj16h9jlho' },
    { id: 'cmoqfw82u000hv9pope9g26q2', title: 'Mr.', fullName: 'Nasa', relationship: 'Head', isBreadwinner: true, occupation: 'Mason', status: 'ACTIVE', familyCardId: 'cmoqfvgwd000fv9ponydofoca' },
    { id: 'cmoqfx5fo000jv9po9ze97jg7', title: 'Mrs.', fullName: 'Fathima Nasa', relationship: 'Spouse', occupation: 'Teacher', status: 'ACTIVE', familyCardId: 'cmoqfvgwd000fv9ponydofoca' },
    { id: 'cmoqfyk41000lv9povmokwgin', title: 'Miss.', fullName: 'FathiNisa', relationship: 'Daughter', isStudent: true, status: 'ACTIVE', familyCardId: 'cmoqfvgwd000fv9ponydofoca' },
    { id: 'cmopedqd4001av9rju0i9v8nq', title: 'Mr.', fullName: 'Mohammed Jabbar', relationship: 'Head', isBreadwinner: true, occupation: 'Businessman', status: 'ACTIVE', familyCardId: 'cmopec89o0018v9rj16h9jlho', email: 'reyaas240@gmail.com', phone: '92800119' },
    { id: 'cmopefmei001cv9rj7l3arpc5', title: 'Miss.', fullName: 'Fathima Jabbar', relationship: 'Spouse', occupation: 'Teacher', status: 'ACTIVE', familyCardId: 'cmopec89o0018v9rj16h9jlho', phone: '0761351036' },
    { id: 'cmopen8we001mv9rjwq5f50e9', title: 'Mr.', fullName: 'Bicasi', relationship: 'Head', isBreadwinner: true, occupation: 'Businessman', status: 'ACTIVE', familyCardId: 'cmopemi8g001kv9rjkj6kf3f6', email: 'bica@gmail.com', phone: '0767740428' },
    { id: 'cmor5hecv0005v9atxsw9nrk3', title: 'Mr.', fullName: 'Kana', relationship: 'Head', isBreadwinner: true, occupation: 'Businessman', status: 'ACTIVE', familyCardId: 'cmor5gik70003v9atp6fgc8l7', phone: '072363284' },
    { id: 'cmor5immx0007v9atlw7edfg2', title: 'Mrs.', fullName: 'Kamili Kana', relationship: 'Spouse', occupation: 'Housewife', status: 'ACTIVE', familyCardId: 'cmor5gik70003v9atp6fgc8l7' },
    { id: 'cmostv8x4000fv921d68rdz5f', title: 'Mr.', fullName: 'M J M Mooooo', relationship: 'Head', isBreadwinner: true, occupation: 'Engineer', status: 'ACTIVE', familyCardId: 'cmostu5wy000dv921958kyd95' },
    { id: 'cmostwgpn000hv921lyej0zzc', title: 'Mrs.', fullName: 'Fathima Mooooos', relationship: 'Spouse', occupation: 'Housewife', status: 'ACTIVE', familyCardId: 'cmostu5wy000dv921958kyd95' },
    { id: 'cmotkzkw10007v9vsexc31606', title: 'Mr.', fullName: 'Jaaaanis', relationship: 'Head', isBreadwinner: true, occupation: 'Engineer', status: 'ACTIVE', familyCardId: 'cmotkyv6c0005v9vskgkgwo5j' },
  ];

  for (const m of (members as any[])) {
    await prisma.familyMember.upsert({
      where: { id: m.id },
      update: { ...m, dob: m.dob || new Date('1990-01-01') },
      create: { ...m, dob: m.dob || new Date('1990-01-01') }
    });
  }

  // 10. Registration Requests
  console.log("📝 Restoring Registration Requests...");
  const requests = [
    { id: 'cmotj6y0d0002v9qc93bazfdl', fullName: 'KKK', email: 'zetatutorhub@gmail.com', phone: '98348938943', mahallaName: 'KKK Main Mahalla', status: 'APPROVED', isVerified: true, licensePlanId: 'cmotfucbk0000v9gasvm6v5by', address: '555500, Ukuwela', country: 'Sri Lanka', district: 'Matale', province: 'Central', selfieUrl: '/uploads/registrations/selfies/1778040141949-timetablechange.jpg', governmentIdUrl: '/uploads/registrations/ids/1778040141827-maydayNotice.jpg' },
    { id: 'cmosb9usm0001v9bhwy7naiul', fullName: 'Rey', email: 'zetatutoronline@gmail.com', phone: '0768242424', mahallaName: 'MNM Main Mahalla', status: 'APPROVED', isVerified: true, licensePlanId: 'cmotfucbk0000v9gasvm6v5by', address: 'No 68, Ukuwela', country: 'Sri Lanka', district: 'Matale', province: 'Central', selfieUrl: '/uploads/registrations/selfies/1777966374666-timetablechange.jpg', governmentIdUrl: '/uploads/registrations/ids/1777966374601-maydayNotice.jpg' },
    { id: 'cmop7b8so0000v9rjfda9qw4m', fullName: 'Reyaas', email: 'reyaas240olf@gmail.com', phone: '+96892800119', mahallaName: 'WM Jumma Masjid', status: 'APPROVED', isVerified: true, licensePlanId: 'cmotfucc10001v9gaychcsrcp', address: 'NO 606060, Warakamura', country: 'Sri Lanka', district: 'Matale', province: 'Central' },
    { id: 'cmotr38l6000fv9vs5lezsjr2', fullName: 'wmadmin', email: 'reyaas240@gmail.com', phone: '9893432432', mahallaName: 'WJM Jumma Masjid', status: 'APPROVED', isVerified: true, licensePlanId: 'cmotfucc40002v9gabxm8bn4q', address: '849332,Warakamura', country: 'Sri Lanka', district: 'Matale', province: 'Central', selfieUrl: '/uploads/registrations/selfies/1778053405972-timetablechange.jpg', governmentIdUrl: '/uploads/registrations/ids/1778053405850-maydayNotice.jpg' },
    { id: 'cmowco3bd0006v99aeoafg5qh', fullName: 'crest field', email: 'crestfieldhr@gmail.com', phone: '878748234', mahallaName: 'Crest Main Mahalla', status: 'PENDING', isVerified: false, licensePlanId: 'cmotfucbk0000v9gasvm6v5by', address: '600000, Main St', country: 'Sri Lanka', district: 'Matale', province: 'Central', selfieUrl: '/uploads/registrations/selfies/1778210583165-—Pngtree—free-demo-flat-banner-vector_9098993-(1).jpg', governmentIdUrl: '/uploads/registrations/ids/1778210583092-—Pngtree—free-demo-flat-banner-vector_9098993.jpg' },
  ];

  for (const r of requests) {
    await prisma.registrationRequest.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }

  console.log("✅ Data restoration complete!");
  console.log("⚠️ Advanced records (Committees, Funds, etc.) were not included but core entities are back.");
}

main()
  .catch((e) => {
    console.error("❌ Restoration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
