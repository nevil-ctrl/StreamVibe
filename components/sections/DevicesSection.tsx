import { DeviceCard } from '../ui/DeviceCard';
import { getServerTranslations } from '@/lib/i18n/get-locale';

export default async function DevicesSection() {
  const { t } = await getServerTranslations();

  const devices = [
    {
      icon: '/svg/phone.svg',
      title: t('devices.smartphones'),
      description: t('devices.smartphonesDesc'),
    },
    {
      icon: '/svg/tablet.svg',
      title: t('devices.tablet'),
      description: t('devices.tabletDesc'),
    },
    {
      icon: '/svg/smart_tv.svg',
      title: t('devices.smartTv'),
      description: t('devices.smartTvDesc'),
    },
    {
      icon: '/svg/laptop.svg',
      title: t('devices.laptops'),
      description: t('devices.laptopsDesc'),
    },
    {
      icon: '/svg/console.svg',
      title: t('devices.gamingConsoles'),
      description: t('devices.gamingConsolesDesc'),
    },
    {
      icon: '/svg/vt.svg',
      title: t('devices.vrHeadsets'),
      description: t('devices.vrHeadsetsDesc'),
    },
  ];

  return (
    <section className="container mx-auto w-full flex flex-col px-4 py-12">
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('devices.title')}
        </h2>
        <p className="text-[#999999] text-base max-w-[600px] leading-relaxed">
          {t('devices.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <DeviceCard
            key={device.title}
            icon={device.icon}
            title={device.title}
            description={device.description}
          />
        ))}
      </div>
    </section>
  );
}
