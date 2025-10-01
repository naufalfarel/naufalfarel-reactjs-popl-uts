import React from "react";

const Footer = () => {
  return (
    <footer className="bg-red-800 text-white py-6">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
        {/* Logo atau Nama Perusahaan */}
        <div className="text-lg font-semibold">©TabbyCare</div>
        {/* Link Navigasi */}
        {/* <nav className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-white">Home</a>
          <a href="#" className="text-gray-400 hover:text-white">About</a>
          <a href="#" className="text-gray-400 hover:text-white">Services</a>
          <a href="#" className="text-gray-400 hover:text-white">Contact</a>
        </nav> */}
        {/* Social Media Icons (Optional) */}
        <div className="flex space-x-4">
          <a href="#" className="text-gray-400 hover:text-white">
            {/* Icon Instagram */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-instagram"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            {/* Icon Twitter */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-twitter">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43 1c-.88.52-1.85.89-2.88 1.09A4.48 4.48 0 0 0 16.43 0a4.48 4.48 0 0 0-4.48 4.48 4.47 4.47 0 0 0 .11 1.02C7.69 5.36 4.07 3.78 1.64 1A4.48 4.48 0 0 0 .8 3.86a4.48 4.48 0 0 0 2 3.74A4.48 4.48 0 0 1 .89 6.9v.05A4.48 4.48 0 0 0 4.48 11a4.45 4.45 0 0 1-2 .08 4.48 4.48 0 0 0 4.19 3.11A8.98 8.98 0 0 1 1 16.33a12.74 12.74 0 0 0 6.88 2.02c8.28 0 12.8-6.86 12.8-12.8 0-.2 0-.4-.01-.61A9.2 9.2 0 0 0 24 4.59c-.87.38-1.8.63-2.76.75z"></path>
            </svg> */}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
