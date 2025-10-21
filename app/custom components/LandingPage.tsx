import Head from "next/head";
import Image from "next/image";
import HeroImg from "@/public/assets/favicon.png";
import step1Img from "@/public/assets/step1.png";
import step2Img from "@/public/assets/step2.png";
import step3Img from "@/public/assets/step3.png";
import {
  FaCheckCircle,
  FaMapMarkedAlt,
  FaRegCalendarCheck,
  FaRobot,
} from "react-icons/fa";
import Link from "next/link";

const steps = [
  {
    id: 1,
    img: step1Img,
    heading: "Where is your next trip?",
    desc: "Tell us what you enjoy the most. Our Artificial Intelligence will curate an itinerary matching all your needs.",
    bulletPoints: [
      "What is the purpose of your trip?",
      "What are your interests?",
      "With who do you go with?",
      "How long do you stay?",
      "What is your budget?",
    ],
  },
  {
    id: 2,
    img: step2Img,
    heading: "Your trip will be ready in a matter of seconds",
    desc: "Leave all the heavy lifting to us. Just enjoy your trip",
    bulletPoints: [
      "See the approximate time you need in each place",
      "Make the most of your precious travel days",
      "Share it privately or publicly",
    ],
  },
  {
    id: 3,
    img: step3Img,
    heading: "You are in control",
    desc: "Move, modify, or remove anything you want. With every change our AI will better adapt to your personal needs and updates the itinerary.",
    bulletPoints: [
      "See the approximate time you need in each place",
      "Make the most of your precious travel days",
      "Share it privately or publicly",
    ],
  },
];

const features = [
  {
    id: 1,
    title: "AI Personalization",
    description: "Trips tailored to your style, preferences, and pace.",
    icon: FaRobot,
    color: "text-blue-600 bg-blue-100",
  },
  {
    id: 2,
    title: "Smart Recommendations",
    description: "Discover hidden gems and must-see spots.",
    icon: FaMapMarkedAlt,
    color: "text-green-600 bg-green-100",
  },
  {
    id: 3,
    title: "Organized Itineraries",
    description: "Smooth, stress-free plans for every adventure.",
    icon: FaRegCalendarCheck,
    color: "text-purple-600 bg-purple-100",
  },
];
const spots = [
  { name: "Hunza", img: "/assets/hunza.webp" },
  { name: "Skardu", img: "/assets/skardu.jpg" },
  { name: "Fairy Meadows", img: "/assets/fairy-meadows.jpg" },
  { name: "Chitral", img: "/assets/chitral.jpg" },
  { name: "Swat", img: "/assets/swat-valley.webp" },
  // { name: "Kumrat", img: "/assets/kumrat.jpg" },
];
export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Safar AI – AI Travel Planner</title>
        <meta
          name="description"
          content="Plan personalized trips to the Northern Areas of Pakistan with AI."
        />
      </Head>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center text-grayed ">
        {/* left  */}
        <div>
          <Image width={300} src={HeroImg} alt="favicon" />
        </div>
        {/* right  */}
        <div className="p-4 sm:p-0">
          <h1 className="text-xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3">
            <span className="text-submit"> PLAN </span> YOUR NEXT ADVENTURE{" "}
            <br />
            TO NORTHERN PAKISTAN
          </h1>
          <p className="sm:text-lg md:text-xl  text-center mx-w-2xl m-auto">
            We’ll create your smart itinerary with the help of artificial
            intelligence
          </p>
          <button
            type="button"
            className="p-3 my-4 text-sm sm:p-4 sm:text-md md:text-xl font-bold text-white rounded-lg  bg-blue-600 cursor-pointer hover:bg-blue-500 ease-in "
          >
            <Link href={"/app"}>Start Planning Now</Link>{" "}
          </button>
        </div>
      </section>

      {/* steps sections  */}

      <section className="p-6 sm:p-16 lg:p-24 bg-gradient-to-b from-white to-gray-50 ">
        {steps &&
          steps.map((step) => {
            return (
              <div
                key={step.id}
                className={`flex flex-col lg:flex-row my-16 lg:items-center lg:justify-center ${
                  step.id === 2 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image Side */}
                <div className="lg:w-[45%] flex justify-center">
                  <Image
                    className="w-64 lg:w-[28rem] rounded-2xl hidden md:block  "
                    src={step.img}
                    alt={`Step ${step.id}`}
                  />
                </div>

                {/* Text Side */}
                <div className="lg:w-[50%]">
                  <div className="bg-blue-100 w-fit px-4 py-2 text-blue-700 rounded-full font-semibold shadow-sm">
                    Step {step.id}
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight my-6 text-gray-800">
                    {step.heading}
                  </h2>

                  <div className="space-y-3">
                    {step.bulletPoints.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <FaCheckCircle className="text-green-500 text-lg mt-1" />
                        <span className="text-base sm:text-lg">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </section>

      {/* Features Section */}
      <section className="p-10 bg-gray-50">
        <h2 className="text-center text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-14 text-gray-800">
          WHY SAFAR AI?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="p-8 text-center rounded-2xl shadow-md hover:shadow-xl transition bg-white border border-gray-100 hover:border-blue-200"
            >
              <div
                className={`flex items-center justify-center w-14 h-14 mx-auto mb-6 rounded-full ${feature.color}`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations Showcase */}
      <section className="p-8 md:py-20 bg-white">
        <h2 className="text-center text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-14 text-gray-800">
          POPULAR LOCATIONS
        </h2>

        {/* Responsive grid layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot, idx) => (
            <div
              key={spot.name}
              className={`relative rounded-xl overflow-hidden shadow-lg group ${
                idx % 5 === 0 ? "sm:row-span-2" : "h-64"
              }`}
            >
              {/* Image covers whole parent */}
              <Image
                src={spot.img}
                alt={spot.name}
                fill
                className="object-cover w-full h-full"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition"></div>
              {/* Title */}
              <h3 className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow">
                {spot.name}
              </h3>
            </div>
          ))}
        </div>
      </section>
      {/* Final CTA */}
      <section className="py-20 px-6 text-center bg-gray-100 text-grayed">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Plan Your Adventure?
        </h2>
        <button className="px-8 py-4 border border-gray-400 hover:bg-gray-200  text-grayed rounded-full font-semibold cursor-pointer transition">
          <Link href={"/app"}>Plan My Trip with Safar AI</Link>
        </button>
      </section>
      <div className="flex items-center justify-center bg-gray-100">
        <div>
          <Image width={50} src={HeroImg} alt="logo" />
        </div>
        <div>© 2025 safarai. All rights reserved.</div>
      </div>
    </>
  );
}
