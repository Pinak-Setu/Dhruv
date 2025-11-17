import GlassSectionCard from '@/components/GlassSectionCard';

export const metadata = {
  title: 'Glass Test',
};

export default function GlassTestPage() {
  return (
    <div className="min-h-screen bg-dark-gradient p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Glass Migration Test</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary Cards */}
        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">📍 स्थान सारांश</h2>
          <p className="text-white/80">रायगढ़ (15), बिलासपुर (12), रायपुर (8)</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🎯 गतिविधि सारांश</h2>
          <p className="text-white/80">विकास कार्य (25), योजना (18), निरीक्षण (12)</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">📊 कुल ट्वीट</h2>
          <p className="text-3xl font-black text-teal-200">1,247</p>
        </GlassSectionCard>

        {/* Analytics Cards */}
        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🧩 इवेंट विश्लेषण</h2>
          <p className="text-white/80">विकास कार्य, योजना, निरीक्षण, लोकार्पण</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🗺️ भू-मानचित्रण</h2>
          <p className="text-white/80">रायगढ़ कवरेज: 85% (42/50 ग्राम)</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🏗️ विकास कार्य</h2>
          <p className="text-white/80">उद्घाटन, निरीक्षण, लोकार्पण, निर्माण</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🫱 समाज आधारित</h2>
          <p className="text-white/80">जाति समुदाय, लक्ष्य समूह, सामाजिक पहुंच</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🪔 योजना विश्लेषण</h2>
          <p className="text-white/80">स्वास्थ्य, शिक्षा, रोजगार, कृषि योजनाएं</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🏛️ रायगढ़ अनुभाग</h2>
          <p className="text-white/80">स्थानीय घटनाएं, समुदाय डेटा, कवरेज</p>
        </GlassSectionCard>

        {/* Review Cards */}
        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">✍️ समीक्षा इंटरफेस</h2>
          <p className="text-white/80">ट्वीट समीक्षा, एआई सहायता, मैनुअल ओवरराइड</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">🧭 कमांड पैनल</h2>
          <p className="text-white/80">सिस्टम स्वास्थ्य, पाइपलाइन मॉनिटर, कॉन्फिग</p>
        </GlassSectionCard>

        <GlassSectionCard>
          <h2 className="text-xl font-bold text-white mb-4">📄 रिपोर्ट निर्यात</h2>
          <p className="text-white/80">PDF, Excel, CSV एक्सपोर्ट विकल्प</p>
        </GlassSectionCard>
      </div>
    </div>
  );
}