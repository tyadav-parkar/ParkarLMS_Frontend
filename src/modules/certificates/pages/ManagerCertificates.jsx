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
"https://th.bing.com/th/id/OIP.2Qgctk0Yiv4jNbAOT6GG5QAAAA?w=173&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3%22"
  },
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
"https://tse4.mm.bing.net/th/id/OIP.2Ij3qW8eyq1JtJB16BmVZQAAAA?w=350&h=250&rs=1&pid=ImgDetMain&o=7&rm=3%22"
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
        "https://th.bing.com/th/id/OIP.yQCbwb79Zrf88hkOclCgOwHaHa?w=179&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3%22"
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