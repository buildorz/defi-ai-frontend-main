import React from "react";


export default function WhyDefi() {
  const cards = [
    {
      title: "Intuitive Interface",
      description:
        "DeFi AI is designed for simplicity, allowing users to interact with decentralized finance effortlessly, even if they're new to crypto.",
    },
    {
      title: "Seamless Transactions",
      description:
        "With advanced AI and real-time gas fee tracking, DeFi AI ensures secure and efficient transactions every time.",
    },
    {
      title: "Cross-Chain Support",
      description:
        "Manage assets across Base, Ethereum, BSC, and Polygon—all in one unified platform for maximum convenience.",
    },
    {
      title: "Portfolio Insights",
      description:
        "Track and manage your investments with detailed insights and analytics, tailored to your financial goals.",
    },
    {
      title: "Voice Commands",
      description:
        "Simplify your experience with voice commands, making DeFi management faster and more accessible than ever.",
    },
    {
      title: "Personalized Alerts",
      description:
        "Stay informed with real-time updates and personalized notifications about market trends and gas fees.",
    },
    {
      title: "Enhanced Security",
      description:
        "Benefit from state-of-the-art security measures, ensuring your assets and data are protected at all times.",
    },
    {
      title: "24/7 Support",
      description:
        "Get assistance whenever you need it with our round-the-clock support team, dedicated to resolving your queries.",
    },
  ];


  return (
    <div className="max-w-[1440px] mx-auto py-[100px]">
      <div className="grid md:grid-cols-2 grid-cols-1 px-5 text-white">
        <div className="col-span-1">
          <div className="flex justify-between md:gap-0 gap-4 h-full flex-col">
            <div>
              <h6 className="text-[10px]">Why DEFI AI</h6>
              <h4 className="text-[30px] leading-[35px] mt-2">
                The DEFI AI <br /> Difference
              </h4>
            </div>
            <div>
              <p className="text-sm">Ready to give it a try?</p>
              <button className="h-[38px] px-5 bg-[#8f259b] mt-2 rounded-full text-sm">Get Started</button>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="flex flex-col md:items-end">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:mt-0 mt-6">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="md:w-[250px] w-full flex gap-3 items-start py-5 px-3 border border-white/30 rounded-[10px]"
                >
                  <div className="w-[40px] h-[40px]"></div>
                  <div>
                    <h5>{card.title}</h5>
                    <p className="text-xs mt-2">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}