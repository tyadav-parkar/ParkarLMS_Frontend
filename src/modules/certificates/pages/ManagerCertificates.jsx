import { useState } from 'react';
import { Search, Award, X, Calendar, Building, Download, ExternalLink, Clock } from 'lucide-react';

const certificatesData = [
  {
   id: 1,
    name: "Certified ScrumMaster",
    issuer: "Scrum Alliance",
    issuedDate: "2024-02-10",
    expiryDate: "2026-02-10",
    credentialId: "CSM-2024-009876",
    category: "Agile",
    skills: ["Scrum", "Team Leadership", "Agile Coaching"],
    imageUrl:
"data:image/jpeg;base64,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",  },
  {
    id: 2,
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    issuedDate: "2024-01-15",
    expiryDate: "2027-01-15",
    credentialId: "AWS-CSA-2024-001234",
    category: "Cloud",
    skills: ["AWS", "Cloud Architecture", "System Design"],
    imageUrl:
      "data:image/jpeg;base64,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"
},
  {
    id: 3,
    name: "PMP — Project Management Professional",
    issuer: "PMI",
    issuedDate: "2023-06-01",
    expiryDate: "2026-06-01",
    credentialId: "PMI-PMP-2023-445500",
    category: "Management",
    skills: ["Project Management", "Risk Management", "Stakeholder Management"],
    imageUrl:
"https://tromenzlearning.com/public/assets/img/products/2022-08-11-16602371121505528946.png"  },
  {
    id: 4,
    name: "Google Cloud Professional Architect",
    issuer: "Google",
    issuedDate: "2023-03-20",
    credentialId: "GCP-PA-2023-772211",
    category: "Cloud",
    skills: ["GCP", "Cloud Architecture", "DevOps"],
    imageUrl:
        "https://storage.googleapis.com/gweb-cloudblog-publish/images/cloud-architect-certification-1mxtg.max-700x700.PNG"
},
];

export default function ManagerCertificates() {
  const [searchQuery, setSearchQuery]               = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [addModalOpen, setAddModalOpen]             = useState(false);

  const filtered = certificatesData.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const thisYear = certificatesData.filter(
    (c) => new Date(c.issuedDate).getFullYear() === new Date().getFullYear()
  ).length;

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your earned certifications</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span>
          Add Certificate
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Certificates</p>
            <p className="text-2xl font-bold text-blue-700 mt-0.5">{certificatesData.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Earned This Year</p>
            <p className="text-2xl font-bold text-green-700 mt-0.5">{thisYear}</p>
          </div>
        </div>
      </div>

      {/* ── Search + Grid ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">No certificates found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCertificate(cert)}
                  className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={cert.imageUrl}
                      alt={cert.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">
                      {cert.category}
                    </span>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {cert.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Building className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{cert.issuer}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{cert.issuedDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Certificate detail modal ──────────────────────────────────── */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Certificate Details</h2>
              <button onClick={() => setSelectedCertificate(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="relative h-52 rounded-xl overflow-hidden">
                <img src={selectedCertificate.imageUrl} alt={selectedCertificate.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white leading-snug">{selectedCertificate.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-white/80 text-sm">
                    <Building className="w-4 h-4" />
                    {selectedCertificate.issuer}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-600">Issued Date</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{selectedCertificate.issuedDate}</p>
                </div>
                {selectedCertificate.expiryDate ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-gray-600">Expiry Date</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{selectedCertificate.expiryDate}</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-600">Validity</span>
                    </div>
                    <p className="text-sm font-bold text-green-700">No Expiry</p>
                  </div>
                )}
                <div className="col-span-2 bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600">Credential ID</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 font-mono">{selectedCertificate.credentialId}</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* ── Add Certificate modal ─────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Add Certificate</h2>
              <button onClick={() => setAddModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Certificate Name *</label>
                <input type="text" placeholder="e.g. PMP — Project Management Professional" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Issuing Organisation *</label>
                <input type="text" placeholder="e.g. PMI" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Issued Date *</label>
                  <input type="date" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Expiry Date</label>
                  <input type="date" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Credential ID</label>
                <input type="text" placeholder="e.g. PMI-PMP-2023-445500" className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Upload Certificate</label>
                <div className="mt-1.5 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-300 mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddModalOpen(false)} className="flex-1 py-2.5 px-4 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                  Save Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}