import React from 'react'

const data = {
  title: 'Бидний тухай',
  description: `ЭХА Энтертайнмент ХХК нь арав гаруй жил байгууллагын захиалгат видёо, клип, захиалгат нэвтрүүлэг, баримтат кино,
хэд хэдэн уран сайхны кино зэргийг хийж гүйцэтгэж ирсэн баг хамт олноор багаа бүрдүүлж, 2017 онд нэрээ шинэчлэн
байгуулсан компани юм`,
  text1: `Бид танай байгууллагатай бүх төрлийн зураг авалт, дүрс бичлэгийн үйлчилгээгээр хамтран ажиллах хүсэлтэй байна.`,
  'Зураг авалт': [
    'Танилцуулга',
    'Интерьер',
    'Хот, барилга байгууламж',
    'Бүтээгдэхүүн, үйлчилгээний',
    'Арга хэмжээ, үйл ажиллагааны',
    'Байгууллага, хамт олны',
    'Тусгай захиалгат зураг авалтуудыг хийж гүйцэтгэнэ.',
  ],
  Бүтээгдэхүүн: ['Фото хэвлэл', 'Зургийн галлерэй', 'Зургийн цомог', 'Жааз'],
  'Дүрс бичлэг': [
    'Шторк Реклам',
    'Танилцуулга видео',
    'Тэмдэглэлт үйл явдлын бичлэг',
    'Захиалгат нэвтүүлэг',
    'Баримтат кино',
    'Видео клип',
  ],
  'Цагийн хуваарь': {
    Даваа: '13:00 - 20:00',
    Мягмар: '10:00 - 20:00',
    Лхагва: '10:00 - 20:00',
    Пүрэв: '10:00 - 20:00',
    Баасан: '10:00 - 20:00',
    Бямба: '10:00 - 20:00',
    Ням: '10:00 - 20:00',
  },
}

const AboutUs: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 items-center p-4 max-w-5xl mx-auto">
      <span className="font-bold text-5xl">{data.title}</span>
      <p className="text-justify text-base">{data.description}</p>
      <p className="text-base">{data.text1}</p>
      <img src="/about-us.png" alt="about us" />
      <div className="flex w-full justify-between flex-wrap md:flex-nowrap">
        <div className="flex flex-col items-start w-full max-w-xs">
          <span className="text-base font-bold">Зураг авалт:</span>
          <ul className="text-sm list-disc">
            {data['Зураг авалт'].map((each) => (
              <li className="ml-4" key={each}>
                {each}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start w-full max-w-xs">
          <span className="text-base font-bold">Бүтээгдхүүн:</span>
          <ul className="text-sm list-disc">
            {data['Бүтээгдэхүүн'].map((each) => (
              <li className="ml-4" key={each}>
                {each}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start w-full max-w-xs">
          <span className="text-base font-bold">Дүрс бичлэг:</span>
          <ul className="text-sm list-disc">
            {data['Дүрс бичлэг'].map((each) => (
              <li className="ml-4" key={each}>
                {each}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full max-w-sm flex flex-col items-center">
        <span className="text-2xl font-bold">Цагийн хуваарь</span>
        <div className="w-full flex flex-col gap-2">
          {Object.entries(data['Цагийн хуваарь']).map(([key, value]) => (
            <div className="flex justify-between text-base border-b">
              <span>{key}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <iframe
        title="maps"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2675.2892712271037!2d106.9207971159852!3d47.89208617920471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d9693c52e4e25e9%3A0xbf673160f8fafcf3!2sEXA%20Studio!5e0!3m2!1sen!2smn!4v1624607540501!5m2!1sen!2smn"
        width="100%"
        height="450"
        // style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}

export default AboutUs
