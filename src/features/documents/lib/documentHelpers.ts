import type { DocumentDetail, DocumentUpdateRequest } from '../types/document'

export function toForm(document: DocumentDetail): DocumentUpdateRequest {
  const complainant = document.complainant
  const respondent = document.respondent
  const facts = document.facts
  const content = document.content
  return {
    title: document.title ?? null,
    complainant: {
      name: complainant?.name ?? null, birthDate: complainant?.birthDate ?? null,
      address: complainant?.address ?? null, phone: complainant?.phone ?? null,
      mobilePhone: complainant?.mobilePhone ?? null, email: complainant?.email ?? null,
      receiveStatus: complainant?.receiveStatus ?? null,
    },
    respondent: {
      companyName: respondent?.companyName ?? null, name: respondent?.name ?? null,
      phone: respondent?.phone ?? null, address: respondent?.address ?? null,
      businessType: respondent?.businessType ?? null, employeeCount: respondent?.employeeCount ?? null,
    },
    facts: {
      hireDate: facts?.hireDate ?? null, resignationDate: facts?.resignationDate ?? null,
      employmentStatus: facts?.employmentStatus ?? null, jobDescription: facts?.jobDescription ?? null,
      payDay: facts?.payDay ?? null, contractType: facts?.contractType ?? null,
      unpaidWages: facts?.unpaidWages ?? null, unpaidSeverancePay: facts?.unpaidSeverancePay ?? null,
      unpaidOtherAmount: facts?.unpaidOtherAmount ?? null,
    },
    content: {
      claimReason: content.claimReason, targetLaborOffice: content?.targetLaborOffice ?? null,
      totalUnpaidAmount: content?.totalUnpaidAmount ?? null,
    },
  }
}

function nullableText(value: string | null): string | null {
  return value === null || value.trim() === '' ? null : value
}

function nullableAmount(value: number | null): number | null {
  return value !== null && Number.isFinite(value) ? value : null
}

export function toPatchRequest(value: DocumentUpdateRequest): DocumentUpdateRequest {
  return {
    title: nullableText(value.title),
    complainant: {
      name: nullableText(value.complainant.name),
      birthDate: nullableText(value.complainant.birthDate),
      address: nullableText(value.complainant.address),
      phone: nullableText(value.complainant.phone),
      mobilePhone: nullableText(value.complainant.mobilePhone),
      email: nullableText(value.complainant.email),
      receiveStatus: value.complainant.receiveStatus,
    },
    respondent: {
      companyName: nullableText(value.respondent.companyName),
      name: nullableText(value.respondent.name),
      phone: nullableText(value.respondent.phone),
      address: nullableText(value.respondent.address),
      businessType: value.respondent.businessType,
      employeeCount: nullableText(value.respondent.employeeCount),
    },
    facts: {
      hireDate: nullableText(value.facts.hireDate),
      resignationDate: nullableText(value.facts.resignationDate),
      employmentStatus: value.facts.employmentStatus,
      jobDescription: nullableText(value.facts.jobDescription),
      payDay: nullableText(value.facts.payDay),
      contractType: value.facts.contractType,
      unpaidWages: nullableAmount(value.facts.unpaidWages),
      unpaidSeverancePay: nullableAmount(value.facts.unpaidSeverancePay),
      unpaidOtherAmount: nullableAmount(value.facts.unpaidOtherAmount),
    },
    content: {
      claimReason: value.content.claimReason,
      targetLaborOffice: nullableText(value.content.targetLaborOffice),
      totalUnpaidAmount: nullableAmount(value.content.totalUnpaidAmount),
    },
  }
}

export function pdfFilename(disposition: string | undefined, documentId: number) {
  const encoded = disposition?.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i)?.[1]
  const plain = disposition?.match(/filename\s*=\s*"?([^";]+)"?/i)?.[1]
  let name = plain ?? ''
  if (encoded) {
    try { name = decodeURIComponent(encoded.trim().replace(/^"|"$/g, '')) } catch { /* use plain filename */ }
  }
  const safe = [...name].filter((char) => char !== '/' && char !== '\\' && char.charCodeAt(0) > 31 && char.charCodeAt(0) !== 127).join('').trim()
  return safe || `complaint-${documentId}.pdf`
}

