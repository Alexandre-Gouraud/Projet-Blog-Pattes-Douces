/** Bandeau de titre affiche en haut des pages publiques. */
const Banner = () => {
  return (
    <div className="header">
      <div
        className="w-full h-20 flex justify-center items-center"
        style={{ background: "white" }}
      >
        <h1>
          <em>Pattes Douces</em>
        </h1>
      </div>
    </div>
  );
};

export default Banner;
