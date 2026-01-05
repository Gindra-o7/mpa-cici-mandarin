import React, { useEffect } from "react";

const Background = "/pages/landing-pages/hottest-news/BG.webp";
const cardnews1 = "/pages/landing-pages/hottest-news/card-cici-news-1.webp";
const cardnews2 = "/pages/landing-pages/hottest-news/card-cici-news-2.webp";
const cardnews3 = "/pages/landing-pages/hottest-news/card-cici-news-3.webp";
const cardnews4 = "/pages/landing-pages/hottest-news/card-cici-news-4.webp";
const cardnews5 = "/pages/landing-pages/hottest-news/card-cici-news-5.webp";

const newsCards = [
  {
    image: cardnews5,
    alt: "card5",
    link: "/article/mandarin-naik-tahta-dialek-terancam-punah",
    isNew: true,
  },
  {
    image: cardnews4,
    alt: "card4",
    link: "/article/jalan-jalan-ke-masa-depan",
    isNew: false,
  },
  {
    image: cardnews3,
    alt: "card3",
    link: "/article/bukan-cuma-tren",
    isNew: false,
  },
  {
    image: cardnews2,
    alt: "card2",
    link: "/article/di-balik-tembok-kampus-tiongkok",
    isNew: false,
  },
  {
    image: cardnews1,
    alt: "card1",
    link: "/article/80-tahun-kemenangan-perang-dunia-II",
    isNew: false,
  },
];

export default function HottestNews() {
  const [activeCardMobile, setActiveCardMobile] = React.useState(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const webScrollContainerRef = React.useRef<HTMLDivElement>(null);

  const cardsPerView = 4;
  const maxIndex = Math.max(0, newsCards.length - cardsPerView);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 280 + 16; // width + gap
    const centerPosition = scrollLeft + container.offsetWidth / 2;
    const activeIndex = Math.round((centerPosition - 140) / cardWidth);
    setActiveCardMobile(Math.max(0, Math.min(activeIndex, newsCards.length - 1)));
  };

  const scrollToIndex = (index: number) => {
    if (!webScrollContainerRef.current) return;
    const container = webScrollContainerRef.current;
    const cardWidth = 275 + 16; // width + gap
    container.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const scrollToMobileIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 280 + 16; // width + gap
    const targetScroll = index * cardWidth - (container.offsetWidth / 2 - 140);
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handleMobilePrevious = () => {
    if (activeCardMobile > 0) {
      scrollToMobileIndex(activeCardMobile - 1);
    }
  };

  const handleMobileNext = () => {
    if (activeCardMobile < newsCards.length - 1) {
      scrollToMobileIndex(activeCardMobile + 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <>
      {/*mobile version*/}
      <section
        className="bg-cover px-7 bg-left py-12 -mt-44 md:hidden block -mb-[2%]"
        style={{
          backgroundImage: `url(${Background})`,
        }}
      >
        <div className="flex flex-col justify-center items-center pt-32 gap-5">
          <h1 className="text-white text-2xl font-mochiy-pop-one text-center">CHINA'S HOTTEST NEWS</h1>
          <div className="w-full relative">
            {/* Left Arrow Button - Mobile */}
            <button
              onClick={handleMobilePrevious}
              disabled={activeCardMobile === 0}
              className={`hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg transition-all ${activeCardMobile === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-400 hover:scale-110"}`}
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="black" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div
                className={`flex gap-4 pb-9`}
                style={{
                  paddingLeft: "max(1rem, calc(50vw - 140px))",
                  // No padding right, we use a spacer
                }}
              >
                {newsCards.map((card, index) => (
                  <div
                    key={index}
                    className={`shrink-0 w-[280px] snap-center transition-all duration-300 ease-out cursor-pointer relative`}
                    style={{
                      transform: activeCardMobile === index ? "scale(1)" : "scale(0.85)",
                      opacity: activeCardMobile === index ? 1 : 0.6,
                      borderWidth: activeCardMobile === index ? "4px" : "0px",
                      borderColor: activeCardMobile === index ? "#FFBC2D" : "transparent",
                      borderRadius: "1rem",
                    }}
                    onClick={() => {
                      window.location.href = card.link;
                    }}
                  >
                    <img src={card.image} alt={card.alt} className="w-full h-auto rounded-lg shadow-lg" />
                    {card.isNew && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform duration-300">
                        NEW
                      </div>
                    )}
                  </div>
                ))}
                {/* Spacer for the last item to center */}
                <div
                  className="shrink-0"
                  style={{ width: "calc(50vw - 140px - 1rem)" }}
                />
              </div>
            </div>

            {/* Right Arrow Button - Mobile */}
            <button
              onClick={handleMobileNext}
              disabled={activeCardMobile === newsCards.length - 1}
              className={`hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg transition-all ${activeCardMobile === newsCards.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-400 hover:scale-110"
                }`}
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="black" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/*web version*/}
      <section
        className="bg-cover px-7 py-12 -mt-[14%] 2xl:-mt-[10%] md:block hidden -mb-[2%] relative"
        style={{
          backgroundImage: `url(${Background})`,
        }}
      >
        <div className="flex flex-col justify-center items-center pt-32 gap-5">
          <h1 className="text-white text-2xl font-mochiy-pop-one text-center">CHINA'S HOTTEST NEWS</h1>
          <div className="mx-auto relative w-[1148px]">
            {/* Left Arrow Button */}
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`absolute -left-16 top-1/2 -translate-y-1/2 z-10 bg-[#FFBC2D] rounded-full p-3 shadow-lg transition-all ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-500 hover:scale-110"}`}
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="black" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Cards Container */}
            <div ref={webScrollContainerRef} className="overflow-hidden scrollbar-hide">
              <div className="flex gap-4 pb-4">
                {newsCards.map((card, index) => (
                  <div key={index} className="shrink-0 w-[275px] relative">
                    <img
                      src={card.image}
                      alt={card.alt}
                      className="w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => {
                        window.location.href = card.link;
                      }}
                    />
                    {card.isNew && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform duration-300">
                        NEW
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
              className={`absolute -right-16 top-1/2 -translate-y-1/2 z-10 bg-[#FFBC2D] rounded-full p-3 shadow-lg transition-all ${currentIndex === maxIndex ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-500 hover:scale-110"
                }`}
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="black" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
