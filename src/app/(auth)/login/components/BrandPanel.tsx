const ROUTE_DOTS = [
  { left: "0%", top: "71.4%" },
  { left: "8.333%", top: "82.1%" },
  { left: "23.611%", top: "60.7%" },
  { left: "40.972%", top: "32.1%" },
  { left: "93.055%", top: "10.7%" },
];

export function BrandPanel() {
  return (
    <div className="relative flex min-h-[50vh] min-w-0 flex-col px-6 pt-24 pb-6 md:px-10 md:pt-28 md:pb-10 lg:min-h-auto lg:px-16 lg:pt-12 lg:pb-14">
      {/* Agency Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 border-b border-white/10 bg-emerald-950/80 px-6 py-4 backdrop-blur-md lg:static lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-gold text-brand-gold md:h-12 md:w-12">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6">
            <path d="M1.99927 22.0009L16.0004 7.99975M16.0004 7.99975H18.0005C19.0615 7.99975 20.079 7.57829 20.8292 6.82808C21.5794 6.07788 22.0009 5.06038 22.0009 3.99943V1.99927H20.0007C18.9398 1.99927 17.9223 2.42073 17.1721 3.17093C16.4218 3.92114 16.0004 4.93864 16.0004 5.99959V7.99975ZM6.53009 17.4705C7.18354 16.8145 7.55043 15.9263 7.55043 15.0003C7.55043 14.0744 7.18354 13.1861 6.53009 12.5301L4.99997 11L3.46984 12.5301C2.81639 13.1861 2.4495 14.0744 2.4495 15.0003C2.4495 15.9263 2.81639 16.8145 3.46984 17.4705L4.99997 19.0006M6.53009 17.4705L4.99997 19.0006M6.53009 17.4705C7.18612 16.8171 8.07388 16.4506 8.99983 16.4506C9.92577 16.4506 10.814 16.8175 11.47 17.471L13.0001 19.0011L11.47 20.5312C10.814 21.1847 9.92577 21.5516 8.99983 21.5516C8.07388 21.5516 7.18566 21.1847 6.52963 20.5312L4.99997 19.0006M10.5304 13.4702C11.1839 12.8142 11.5508 11.9259 11.5508 11C11.5508 10.074 11.1839 9.18582 10.5304 8.52979L9.00028 6.99967L7.47016 8.52979C6.81671 9.18582 6.44982 10.074 6.44982 11C6.44982 11.9259 6.81671 12.8142 7.47016 13.4702L9.00028 15.0003M10.5304 13.4702L9.00028 15.0003M10.5304 13.4702C11.1864 12.8167 12.0742 12.4503 13.0001 12.4503C13.9261 12.4503 14.8143 12.8172 15.4703 13.4706L17.0005 15.0008L15.4703 16.5309C14.8143 17.1843 13.9261 17.5512 13.0001 17.5512C12.0742 17.5512 11.186 17.1843 10.5299 16.5309L9.00028 15.0003M14.5307 9.46987C15.1842 8.81384 15.5511 7.92561 15.5511 6.99967C15.5511 6.07372 15.1842 5.1855 14.5307 4.52947L13.0006 2.99935L11.4705 4.52947C10.817 5.1855 10.4501 6.07372 10.4501 6.99967C10.4501 7.92561 10.817 8.81384 11.4705 9.46987L13.0006 11M14.5307 9.46987L13.0006 11M14.5307 9.46987C15.1868 8.81641 16.0745 8.44998 17.0005 8.44998C17.9264 8.44998 18.8146 8.81687 19.4707 9.47032L21.0008 11.0004L19.4707 12.5306C18.8146 13.184 17.9264 13.5509 17.0005 13.5509C16.0745 13.5509 15.1863 13.184 14.5303 12.5306L13.0006 11" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-gold md:text-[13px]">Ministry of Agriculture</p>
          <p className="text-xs text-white/90 md:text-[15px]">Federal Democratic Republic of Ethiopia</p>
        </div>
      </div>

      {/* Hero copy */}
      <div className="relative z-10 flex flex-1 flex-col lg:pt-20">
        <h1 className="max-w-md text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[52px]">
          Every plot,
          <br />
          every farmer,
          <br />
          accounted for.
        </h1>

        {/* Dashed route line — spans the full viewport width and runs behind the sign-in card */}
        <div className="pointer-events-none relative z-0 my-8 -ml-6 h-14 w-screen md:-ml-10 lg:mt-10 lg:mb-5 lg:-ml-16" aria-hidden={true}>
          <svg className="h-full w-full text-brand-gold/80" viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none">
            <path
              d="M0 40 C60 40 60 46 120 46 C230 46 230 34 340 34 C465 34 465 18 590 18 C965 18 965 6 1340 6 C1390 6 1390 20 1440 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* Dots as HTML so they stay perfectly round when the SVG stretches */}
          {ROUTE_DOTS.map((dot) => (
            <span
              key={dot.left}
              className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/80"
              style={dot}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-base font-medium text-brand-gold md:text-[17px]">OpenAgriNet — Development Agent Portal</p>
          <p className="max-w-[440px] text-sm leading-relaxed text-white/70 md:text-base">
            Supporting 12,450 registered farmers across six regions of Ethiopia, one recorded plot at a time.
          </p>
        </div>
      </div>

      {/* Secure Badge */}
      <div className="relative z-10 mt-10 flex items-center gap-2.5 text-white/60">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-sm font-medium">Official Government Secure Portal</span>
      </div>
    </div>
  );
}
