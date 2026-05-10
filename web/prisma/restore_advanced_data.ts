const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting advanced data restoration...");

  // 1. Committees
  console.log("👥 Restoring Committees...");
  const committees = [
    { id: 'cmopesdnl001sv9rj43597w7h', name: 'wJ Baithuz zakath', shortCode: 'WBZ', status: 'ACTIVE', mainMahallaId: 'cmott3w84000bv982gjm9ym5l', logo: '/uploads/committees/1777790879147-logo.png', establishedDate: new Date('2010-01-01'), defaultCurrency: 'LKR' },
    { id: 'cmost7s8v0003v921jdzdejvy', name: 'Muhaideen Masjid board of trustees', shortCode: 'MMBOT', status: 'ACTIVE', mainMahallaId: 'cmott3w84000bv982gjm9ym5l', subMahallaId: 'cmoqxa6pb000ov9smnmad6fan', allowMainMahallaView: true, defaultCurrency: 'LKR' },
  ];

  for (const c of committees) {
    await prisma.committee.upsert({ where: { id: c.id }, update: c, create: c });
  }

  // 2. Committee Terms
  console.log("📅 Restoring Committee Terms...");
  const terms = [
    { id: 'cmopetq24001uv9rj4bdzwmxt', name: 'Zakath committee - 2025', startDate: new Date('2025-08-01'), endDate: new Date('2028-07-31'), status: 'ACTIVE', committeeId: 'cmopesdnl001sv9rj43597w7h', financialsStatus: 'APPROVED', financialsApprovedAt: new Date('2026-05-03T11:02:35Z') },
    { id: 'cmostheub0005v921uyz95dza', name: '2026-2029', startDate: new Date('2026-05-01'), endDate: new Date('2029-04-30'), status: 'ACTIVE', committeeId: 'cmost7s8v0003v921jdzdejvy', financialsStatus: 'PENDING' },
  ];

  for (const t of terms) {
    await prisma.committeeTerm.upsert({ where: { id: t.id }, update: t, create: t });
  }

  // 3. Opening Balance Categories
  console.log("💰 Restoring Opening Balance Categories...");
  const obCategories = [
    { id: 'cmopnjram0001v9keihcc8f2r', name: 'Peoples bank account', mainMahallaId: 'cmop7ehze0001v9rjwpytuz1w' },
    { id: 'cmopnvejq0003v9lxf66qbazb', name: 'Petty Cash', mainMahallaId: 'cmop7ehze0001v9rjwpytuz1w' },
  ];

  for (const cat of obCategories) {
    await prisma.openingBalanceCategory.upsert({ where: { id: cat.id }, update: cat, create: cat });
  }

  // 4. Committee Term Balances
  console.log("⚖️ Restoring Committee Term Balances...");
  const balances = [
    { id: 'cmopnlrq40001v9lxcamajkfs', amount: 500000, committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', categoryId: 'cmopnjram0001v9keihcc8f2r' },
    { id: 'cmopnvmtl0007v9lxx1u2ufk6', amount: 150000, committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', categoryId: 'cmopnvejq0003v9lxf66qbazb' },
  ];

  for (const b of balances) {
    await prisma.committeeTermBalance.upsert({ where: { id: b.id }, update: b, create: b });
  }

  // 5. Donors
  console.log("🤝 Restoring Donors...");
  const donors = [
    { id: 'cmopp11qh0001v9ekt93v3s8x', type: 'EXTERNAL', name: 'MMM Rice mill - MR. JANAH', phone: '92800119', email: 'JANAH@Mail.com', mainMahallaId: 'cmott3w84000bv982gjm9ym5l' },
    { id: 'cmopuzg8w0001v9e8p5p4xsfe', type: 'EXTERNAL', name: 'RAAS', phone: '92800119', email: 'reyaas240@gmail.com', mainMahallaId: 'cmott3w84000bv982gjm9ym5l' },
    { id: 'cmopvcxj20006v9e8av6gpakw', type: 'INTERNAL', name: 'Bisnari', phone: '9838949834', email: 're@mail.com', familyMemberId: 'cmopepb9k001qv9rj3g07jgyk', mainMahallaId: 'cmott3w84000bv982gjm9ym5l' },
    { id: 'cmopp2ldo0005v9ekbxtuj13y', type: 'INTERNAL', name: 'Mohammed Jabbar', phone: '873949249', email: 'rewr@mail.com', familyMemberId: 'cmopedqd4001av9rju0i9v8nq', mainMahallaId: 'cmott3w84000bv982gjm9ym5l' },
  ];

  for (const d of donors) {
    await prisma.donor.upsert({ where: { id: d.id }, update: d, create: d });
  }

  // 6. Donations
  console.log("💸 Restoring Donations...");
  const donations = [
    { id: 'cmopp11ry0003v9ekmi9a31pg', amount: 1000000, date: new Date('2026-05-03'), paymentMethod: 'CASH', donorId: 'cmopp11qh0001v9ekt93v3s8x', committeeId: 'cmopesdnl001sv9rj43597w7h', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', mainMahallaId: 'cmop7ehze0001v9rjwpytuz1w' },
    { id: 'cmopp2leq0007v9ekx9pcb4kk', amount: 200000, date: new Date('2026-05-03'), paymentMethod: 'CHEQUE', donorId: 'cmopp2ldo0005v9ekbxtuj13y', committeeId: 'cmopesdnl001sv9rj43597w7h', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', mainMahallaId: 'cmop7ehze0001v9rjwpytuz1w' },
  ];

  for (const dn of donations) {
    await prisma.donation.upsert({ where: { id: dn.id }, update: dn, create: dn });
  }

  // 7. Fund Requests
  console.log("📋 Restoring Fund Requests...");
  const fRequests = [
    { id: 'cmopz6kfu0001v9por8684158', committeeId: 'cmopesdnl001sv9rj43597w7h', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', beneficiaryType: 'INTERNAL', familyMemberId: 'cmopeo0ro001ov9rjodfxr2ck', purpose: 'Emergency', description: 'Required to settle some emergency loan.', requestedAmount: 400000, grantedAmount: 225000, status: 'DISBURSED', verified: true, totalDisbursed: 225000, paymentType: 'ONE_TIME' },
    { id: 'cmoqq2mrg0011v9luo91l1py5', committeeId: 'cmopesdnl001sv9rj43597w7h', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', beneficiaryType: 'INTERNAL', familyMemberId: 'cmopeo0ro001ov9rjodfxr2ck', purpose: 'Medical', requestedAmount: 60000, grantedAmount: 100000, status: 'DISBURSED', verified: true, totalDisbursed: 100000, paymentType: 'ONE_TIME' },
    { id: 'cmos2pyju000hv98x82neo6ef', committeeId: 'cmopesdnl001sv9rj43597w7h', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', projectName: '2026 Fund Distribution', beneficiaryType: 'INTERNAL', familyMemberId: 'cmorck1ik0007v9rse7zancug', purpose: 'Living Support', requestedAmount: 10000, grantedAmount: 6000, status: 'ON_GOING', verified: true, totalDisbursed: 24000, paymentType: 'MONTHLY', durationMonths: 7, startMonth: '2026-06', endMonth: '2026-12' },
    { id: 'cmos4w1uz000lv9i06ynfa5l5', committeeId: 'cmopesdnl001sv9rj43597w7h', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', projectName: '2026 Fund Distribution', beneficiaryType: 'INTERNAL', familyMemberId: 'cmor9ck1v0003v9rszhal41w6', purpose: 'Self Employment', requestedAmount: 400000, grantedAmount: 300000, status: 'DISBURSED', verified: false, totalDisbursed: 300000, paymentType: 'ONE_TIME' },
  ];

  for (const fr of fRequests) {
    await prisma.fundRequest.upsert({ where: { id: fr.id }, update: fr, create: fr });
  }

  // 8. Fund Disbursements
  console.log("💸 Restoring Fund Disbursements...");
  const disbursements = [
    { id: 'cmos1nqqc0001v95fqt18tkh0', fundRequestId: 'cmopz6kfu0001v9por8684158', amount: 225000, method: 'CASH', chequeNumber: '788423432', handedOverDate: new Date('2026-05-04'), assignedMembers: 'Mohammed Jabbar, Bicasi' },
    { id: 'cmos1nqqi0003v95ffsmmzgzn', fundRequestId: 'cmoqq2mrg0011v9luo91l1py5', amount: 100000, method: 'CHEQUE', chequeNumber: '343534324', handedOverDate: new Date('2026-05-04') },
  ];

  for (const fd of disbursements) {
    await prisma.fundDisbursement.upsert({ where: { id: fd.id }, update: fd, create: fd });
  }

  // 9. Invoices & Subscriptions
  console.log("🧾 Restoring Invoices & Subscriptions...");
  const invoices = [
    { id: 'cmotj6y0o0004v9qcdmhwiqbd', invoiceNo: 'INV-142003-2825', amount: 1000, status: 'PAID', dueDate: new Date('2026-05-13'), paidAt: new Date('2026-05-06'), licensePlanId: 'cmotfucbk0000v9gasvm6v5by', mainMahallaId: 'cmotjo0b00006v9qckbi8fxde', registrationRequestId: 'cmotj6y0d0002v9qc93bazfdl' },
  ];

  for (const inv of invoices) {
    await prisma.invoice.upsert({ where: { id: inv.id }, update: inv, create: inv });
  }

  const subscriptions = [
    { id: 'cmotjo0c40008v9qck2etbgyq', mainMahallaId: 'cmotjo0b00006v9qckbi8fxde', licensePlanId: 'cmotfucbk0000v9gasvm6v5by', status: 'ACTIVE', startDate: new Date('2026-05-06'), nextInvoiceDate: new Date('2026-06-06') },
  ];

  for (const sub of subscriptions) {
    await prisma.subscription.upsert({ where: { id: sub.id }, update: sub, create: sub });
  }

  // 10. Committee Members
  console.log("👔 Restoring Committee Members...");
  const cMembers = [
    { id: 'cmople0e8002mv9rju45eguaj', role: 'President', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', familyMemberId: 'cmopedqd4001av9rju0i9v8nq', status: 'ACTIVE' },
    { id: 'cmopleb78002ov9rjrawh5zs2', role: 'Member', committeeTermId: 'cmopetq24001uv9rj4bdzwmxt', familyMemberId: 'cmopen8we001mv9rjwq5f50e9', status: 'ACTIVE' },
    { id: 'cmostpnbv0007v9211h6c18ds', role: 'Member', committeeTermId: 'cmostheub0005v921uyz95dza', familyMemberId: 'cmor5hecv0005v9atxsw9nrk3', status: 'ACTIVE' },
  ];

  for (const cm of cMembers) {
    await prisma.committeeMember.upsert({ where: { id: cm.id }, update: cm, create: cm });
  }

  // 11. Investigations
  console.log("🔍 Restoring Investigations...");
  const investigations = [
    { id: 'cmoreas6r0007v9ae6lsx5igj', fundRequestId: 'cmoqq2mrg0011v9luo91l1py5', investigators: 'Mohammed Jabbar, Bicasi', visitDate: new Date('2026-05-04'), actualVisitDate: new Date('2026-05-04'), findings: 'Done investigating, explained their needs', attendedMembers: 'Mohammed Jabbar, Bicasi' },
    { id: 'cmos4wxw4000pv9i085ym5x61', fundRequestId: 'cmos4w1uz000lv9i06ynfa5l5', investigators: 'Mohammed Jabbar, Bicasi', visitDate: new Date('2026-05-04'), actualVisitDate: new Date('2026-05-05'), findings: 'Done the investigation, living in a very bad condition with two children', attendedMembers: 'Mohammed Jabbar, Bicasi' },
  ];

  for (const inv of investigations) {
    await prisma.investigation.upsert({ where: { id: inv.id }, update: inv, create: inv });
  }

  // 12. Project Masters
  console.log("📂 Restoring Project Masters...");
  const projects = [
    { id: 'cmos0hg6o000hv9jgs5dfm9yg', name: '2026 Fund Distribution', committeeId: 'cmopesdnl001sv9rj43597w7h' },
  ];

  for (const p of projects) {
    await prisma.projectMaster.upsert({ where: { id: p.id }, update: p, create: p });
  }

  // 13. Request Categories
  console.log("🏷️ Restoring Request Categories...");
  const rCats = [
    { id: 'cmorzrngx0001v9jg3tmywj3m', name: 'Medical', committeeId: 'cmopesdnl001sv9rj43597w7h' },
    { id: 'cmorzrwiv0003v9jge8yl8lno', name: 'Living Support', committeeId: 'cmopesdnl001sv9rj43597w7h' },
    { id: 'cmorzrzq10005v9jgoseee26u', name: 'Housing', committeeId: 'cmopesdnl001sv9rj43597w7h' },
    { id: 'cmorzs5wo0007v9jg9kxo911z', name: 'Self Employment', committeeId: 'cmopesdnl001sv9rj43597w7h' },
    { id: 'cmorzsm2l0009v9jgx8wud490', name: 'Employment', committeeId: 'cmopesdnl001sv9rj43597w7h' },
  ];

  for (const rc of rCats) {
    await prisma.requestCategory.upsert({ where: { id: rc.id }, update: rc, create: rc });
  }

  console.log("✅ Advanced data restoration complete!");
}

main()
  .catch((e) => {
    console.error("❌ Advanced restoration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
