import { DeviceCard } from '../ui/DeviceCard';

const devices = [
  {
    icon: '/svg/phone.svg',
    title: 'Smartphones',
    description:
      'StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store',
  },
  {
    icon: '/svg/tablet.svg',
    title: 'Tablet',
    description:
      'StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store',
  },
  {
    icon: '/svg/smart_tv.svg',
    title: 'Smart TV',
    description:
      'StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store',
  },
  {
    icon: '/svg/laptop.svg',
    title: 'Laptops',
    description:
      'StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store',
  },
  {
    icon: '/svg/console.svg',
    title: 'Gaming Consoles',
    description:
      'StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store',
  },
  {
    icon: '/svg/vt.svg',
    title: 'VR Headsets',
    description:
      'StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store',
  },
];

export default function DevicesSection() {
  return (
    <section className="container mx-auto w-full flex flex-col px-4 py-12">
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          We Provide you streaming experience across various devices.
        </h2>
        <p className="text-[#999999] text-base max-w-[600px] leading-relaxed">
          With StreamVibe, you can enjoy your favorite movies and TV shows
          anytime, anywhere. Our platform is designed to be compatible with a
          wide range of devices, ensuring that you never miss a moment of
          entertainment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '30px' }}>
        {devices.map((device) => (
          <DeviceCard key={device.title} {...device} />
        ))}
      </div>
    </section>
  );
}
