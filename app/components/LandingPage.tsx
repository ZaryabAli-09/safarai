// pages/index.tsx

import Head from "next/head";
import Image from "next/image";
import HeroImg from "@/public/assets/favicon.png";
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
            Start Planning Now{" "}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="p-10   bg-gray-50">
        <h2 className="text-center text-xl sm:text-4xl md:text-5xl font-extrabold leading-tight m-10  text-grayed">
          WHY SAFAR AI ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 text-center  rounded-lg  shadow-lg transition text-grayed border border-gray-200 ">
            <h3 className="md:text-lg font-bold   mb-2">AI Personalization</h3>
            <p className="text-gray-500  font-light text-xs md:text-sm">
              Trips tailored to your style, preferences, and pace.
            </p>
          </div>

          <div className="p-6 text-center  rounded-lg  shadow-lg transition text-grayed border border-gray-200 ">
            <h3 className="md:text-lg font-bold   mb-2">
              {" "}
              Smart Recommendations
            </h3>
            <p className="text-gray-500  font-light text-xs md:text-sm">
              Discover hidden gems and must-see spots.
            </p>
          </div>

          <div className="p-6 text-center  rounded-lg  shadow-lg transition text-grayed border border-gray-200 ">
            <h3 className="md:text-lg font-bold   mb-2">
              {" "}
              Organized Itineraries
            </h3>
            <p className="text-gray-500  font-light text-xs md:text-sm">
              Smooth, stress-free plans for every adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Destinations Showcase */}
      <section className="p-8 md:py-20 md:px-50 ">
        <h2 className="text-center text-xl sm:text-4xl md:text-5xl font-extrabold leading-tight m-10  text-grayed">
          POPULAR LOCATIONS
        </h2>
        <div className="grid grid-cols-4 ">
          {[
            { name: "Hunza", img: "/assets/hunza.webp" },
            { name: "Skardu", img: "/assets/skardu.jpg" },
            { name: "Fairy Meadows", img: "/assets/fairy-meadows.jpg" },
            { name: "Chitral", img: "/assets/chitral.jpg" },
            // { name: "Swat", img: "/assets/swat-valley.webp" },
            // { name: "Kumrat", img: "/assets/kumrat.jpg" },
          ].map((spot) => (
            <div
              key={spot.name}
              className="relative  bg-white transition rounded overflow-hidden"
            >
              {/* Image */}
              <Image
                src={spot.img}
                alt={spot.name}
                width={400}
                height={250}
                className="object-cover w-72 h-56 "
              />

              {/* Black overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

              {/* Text on top */}
              <div className="absolute bottom-2 left-2">
                <h3 className="text-white font-semibold">{spot.name}</h3>
              </div>
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
          Plan My Trip with Safar AI
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
