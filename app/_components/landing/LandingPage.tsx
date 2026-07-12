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
    color: "text-primary bg-accent",
  },
  {
    id: 2,
    title: "Smart Recommendations",
    description: "Discover hidden gems and must-see spots.",
    icon: FaMapMarkedAlt,
    color: "text-primary bg-accent",
  },
  {
    id: 3,
    title: "Organized Itineraries",
    description: "Smooth, stress-free plans for every adventure.",
    icon: FaRegCalendarCheck,
    color: "text-primary bg-accent",
  },
];

// Global, well-known destinations with free Unsplash placeholder images
const spots = [
  {
    name: "Paris",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  },
  {
    name: "Tokyo",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  },
  {
    name: "New York",
    img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  },
  {
    name: "Bali",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  },
  {
    name: "Rome",
    img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
  },
];

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Safar AI – AI Travel Planner</title>
        <meta
          name="description"
          content="Plan personalized trips to any destination in the world with AI-powered itineraries."
        />
      </Head>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center text-foreground">
        {/* Logo */}
        <div>
          <Image width={300} src={HeroImg} alt="SafarAI" />
        </div>
        {/* Headline */}
        <div className="p-4 sm:p-0">
          <h1 className="text-xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3">
            <span className="text-primary">PLAN</span> YOUR NEXT ADVENTURE,{" "}
            <br />
            ANYWHERE
          </h1>
          <p className="sm:text-lg md:text-xl text-center mx-w-2xl m-auto text-muted-foreground">
            We&apos;ll create your smart itinerary with the help of artificial
            intelligence
          </p>
          <Link
            href="/app"
            className="inline-block p-3 my-4 text-sm sm:p-4 sm:text-md md:text-xl font-bold text-white rounded-lg bg-primary hover:bg-primary/90 cursor-pointer transition-colors"
          >
            Start Planning Now
          </Link>
        </div>
      </section>

      {/* Steps Section */}
      <section className="p-6 sm:p-16 lg:p-24 bg-secondary">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col lg:flex-row my-16 lg:items-center lg:justify-center ${
              step.id === 2 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Image Side */}
            <div className="lg:w-[45%] flex justify-center">
              <Image
                className="w-64 lg:w-[28rem] rounded-2xl hidden md:block"
                src={step.img}
                alt={`Step ${step.id}`}
              />
            </div>

            {/* Text Side */}
            <div className="lg:w-[50%]">
              <div className="bg-accent w-fit px-4 py-2 text-primary rounded-full font-semibold shadow-sm">
                Step {step.id}
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight my-6 text-foreground">
                {step.heading}
              </h2>

              <div className="space-y-3">
                {step.bulletPoints.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <FaCheckCircle className="text-primary text-lg mt-1 flex-shrink-0" />
                    <span className="text-base sm:text-lg">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="p-10 bg-white">
        <h2 className="text-center text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-14 text-foreground">
          WHY SAFAR AI?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="p-8 text-center rounded-2xl shadow-md hover:shadow-xl transition bg-white border border-border hover:border-primary/30"
            >
              <div
                className={`flex items-center justify-center w-14 h-14 mx-auto mb-6 rounded-full ${feature.color}`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations Showcase */}
      <section className="p-8 md:py-20 bg-white">
        <h2 className="text-center text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-14 text-foreground">
          POPULAR DESTINATIONS
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot, idx) => (
            <div
              key={spot.name}
              className={`relative rounded-xl overflow-hidden shadow-lg group ${
                idx % 5 === 0 ? "sm:row-span-2" : "h-64"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spot.img}
                alt={spot.name}
                className="object-cover w-full h-full absolute inset-0"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition" />
              {/* Title */}
              <h3 className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow">
                {spot.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center bg-muted text-foreground">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Plan Your Adventure?
        </h2>
        <Link
          href="/app"
          className="inline-block px-8 py-4 border border-border hover:bg-secondary text-foreground rounded-full font-semibold cursor-pointer transition-colors"
        >
          Plan My Trip with Safar AI
        </Link>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-center bg-muted py-4 gap-3">
        <Image width={50} src={HeroImg} alt="SafarAI logo" />
        <div className="text-muted-foreground text-sm">
          © 2025 SafarAI. All rights reserved.
        </div>
      </div>
    </>
  );
}
