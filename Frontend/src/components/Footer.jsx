import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-4 px-4 mt-4 text-center text-sm sm:text-base">
      <p className="truncate">
        &copy; {new Date().getFullYear()} Garage Management System. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
