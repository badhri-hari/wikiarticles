import { FaWikipediaW, FaRegLaughBeam, FaSpaceShuttle } from "react-icons/fa";
import { LuCornerDownRight } from "react-icons/lu";
import {
  SiWikimediacommons,
  SiWikivoyage,
  SiAnimalplanet,
  SiWikidata,
  SiWikibooks,
  SiScpfoundation,
  SiFandom,
} from "react-icons/si";
import {
  GiCaesar,
  GiIceberg,
  GiBanana,
  GiPotato,
  GiUsaFlag,
  GiPlainCircle,
  GiGarlic,
} from "react-icons/gi";
import { IoEarth, IoPlanet } from "react-icons/io5";
import { MdOutlineQuestionMark, MdPeopleAlt } from "react-icons/md";
import { TbRating21Plus, TbRating18Plus } from "react-icons/tb";
import { RiGlobeLine } from "react-icons/ri";
import { ImMan } from "react-icons/im";
import { PiBrain, PiGridFourLight, PiSquaresFourThin } from "react-icons/pi";

const ICONS = {
  Wikipedia: FaWikipediaW,
  "Wikimedia Commons": SiWikimediacommons,
  Wikivoyage: SiWikivoyage,
  Wikispecies: SiAnimalplanet,
  Wikidata: SiWikidata,
  Wikibooks: SiWikibooks,
  Wikinews: IoEarth,
  Wikisource: GiIceberg,
  Wikihow: MdOutlineQuestionMark,
  RationalWiki: PiBrain,
  "Know Your Meme": FaRegLaughBeam,
  Bulbagarden: GiGarlic,
  Edramatica: TbRating21Plus,
  Metapedia: GiCaesar,
  Micronations: RiGlobeLine,
  Unusual: FaWikipediaW,
  "Unusual Places": FaWikipediaW,
  EverybodyWiki: MdPeopleAlt,
  "Polandball Wiki": GiPlainCircle,
  "Polcompball Wiki": PiGridFourLight,
  PolcompballAnarchy: PiSquaresFourThin,
  "Heterodontosaurus Balls": IoPlanet,
  IncelWiki: ImMan,
  Illogicopedia: GiBanana,
  "SCP Foundation": SiScpfoundation,
  Uncyclopedia: GiPotato,
  "UNOP Chronicles": FaSpaceShuttle,
  Pornopedia: TbRating18Plus,
  Conservapedia: GiUsaFlag,
  Fandom: SiFandom,
};

const ICON_STYLES = (logoIsLoading = false) => ({
  Wikipedia: logoIsLoading
    ? { size: "5rem", style: { marginRight: "3px", marginBottom: "-18px" } }
    : { size: "2.5rem", style: { marginLeft: "10px", marginTop: "6px" } },
  Wikinews: logoIsLoading
    ? { size: "4.5rem", style: { marginRight: "3px", marginBottom: "-12px" } }
    : { size: "2.4rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Edramatica: logoIsLoading
    ? { size: "5rem", style: { marginRight: "5.3px", marginBottom: "-12px" } }
    : { size: "3rem", style: { marginLeft: "8px", marginTop: "5px" } },
  "Know Your Meme": logoIsLoading
    ? { size: "4.5rem", style: { marginRight: "5px", marginBottom: "-12px" } }
    : { size: "2.5rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Bulbagarden: logoIsLoading
    ? { size: "4.5rem", style: { marginRight: "5px", marginBottom: "-12px" } }
    : { size: "2.5rem", style: { marginLeft: "8px", marginTop: "5px" } },
  "Wikimedia Commons": logoIsLoading
    ? { size: "4.8rem", style: { marginRight: "-1px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "9px", marginTop: "7px" } },
  Wikisource: logoIsLoading
    ? { size: "5rem", style: { marginRight: "1.5px", marginBottom: "-12px" } }
    : { size: "2.5rem", style: { marginLeft: "9px", marginTop: "7px" } },
  Wikibooks: logoIsLoading
    ? { size: "3.6rem", style: { marginRight: "3px", marginBottom: "-13px" } }
    : { size: "2.3rem", style: { marginLeft: "7px", marginTop: "6px" } },
  Wikihow: logoIsLoading
    ? { size: "3.6rem", style: { marginRight: "3px", marginBottom: "-13px" } }
    : { size: "2.3rem", style: { marginLeft: "7px", marginTop: "6px" } },
  RationalWiki: logoIsLoading
    ? { size: "3.6rem", style: { marginBottom: "-13px" } }
    : { size: "2.3rem", style: { marginLeft: "7px", marginTop: "6px" } },
  Wikivoyage: logoIsLoading
    ? { size: "4.7rem", style: { marginRight: "4px", marginBottom: "-15px" } }
    : { size: "3.5rem", style: { marginLeft: "10px", marginTop: "7px" } },
  Wikispecies: logoIsLoading
    ? {
        size: "4.75rem",
        style: { marginRight: "-14px", marginBottom: "-14px" },
      }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Metapedia: logoIsLoading
    ? { size: "4rem", style: { marginRight: "-5px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Micronations: logoIsLoading
    ? { size: "4rem", style: { marginRight: "2px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Wikidata: logoIsLoading
    ? { size: "4.8rem", style: { marginRight: "8.4px", marginBottom: "-15px" } }
    : { size: "2.6rem", style: { marginLeft: "10px", marginTop: "6px" } },
  EverybodyWiki: logoIsLoading
    ? { size: "4rem", style: { marginRight: "5.5px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  "Polandball Wiki": logoIsLoading
    ? { size: "4rem", style: { marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  "Polcompball Wiki": logoIsLoading
    ? { size: "4rem", style: { marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  PolcompballAnarchy: logoIsLoading
    ? { size: "4rem", style: { marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  "Heterodontosaurus Balls": logoIsLoading
    ? { size: "4rem", style: { marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  IncelWiki: logoIsLoading
    ? { size: "4rem", style: { marginRight: "-7px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Illogicopedia: logoIsLoading
    ? { size: "4rem", style: { marginRight: "-7px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  "SCP Foundation": logoIsLoading
    ? { size: "4rem", style: { marginRight: "0px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Uncyclopedia: logoIsLoading
    ? { size: "4rem", style: { marginRight: "-7px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  "UNOP Chronicles": logoIsLoading
    ? { size: "4rem", style: { marginRight: "-3.5px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Pornopedia: logoIsLoading
    ? { size: "4rem", style: { marginRight: "-1px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Conservapedia: logoIsLoading
    ? { size: "4rem", style: { marginRight: "4px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
  Fandom: logoIsLoading
    ? { size: "4rem", style: { marginRight: "-4px", marginBottom: "-14px" } }
    : { size: "2.6rem", style: { marginLeft: "8px", marginTop: "5px" } },
});

export const renderLogo = (source, logoIsLoading = false) => {
  const baseName = source.split(" (")[0];
  const Icon = ICONS[baseName];
  if (!Icon) return null;
  const iconProps = ICON_STYLES(logoIsLoading)[baseName] || {};
  return <Icon {...iconProps} />;
};

export const sourceOptionsImport = [
  {
    name: "Wikipedia",
    displayName: "Wikipedia",
    icon: <FaWikipediaW style={{ marginRight: "2px" }} />,
    description: "Default",
    isGroupStart: true,
    path: "/articles",
  },
  {
    name: "Unusual",
    displayName: "Wikipedia (Unusual)",
    icon: <LuCornerDownRight />,
    description: "Humorous articles",
    isGroupStart: false,
    path: "/wikipedia_unusual",
  },
  {
    name: "Unusual Places",
    displayName: "Wikipedia (Unusual Places)",
    icon: <LuCornerDownRight />,
    description: "Humorous places",
    isGroupStart: false,
    path: "/wikipedia_unusual_places",
  },
  {
    name: "Simple English",
    displayName: "Wikipedia (Simple English)",
    icon: <LuCornerDownRight />,
    description: "Simple English",
    isGroupStart: false,
    path: "/articles?lang=simple",
  },
  {
    name: "Wikimedia Commons",
    displayName: "Wikimedia Commons",
    icon: <SiWikimediacommons />,
    description: "Media files",
    isGroupStart: true,
    path: "/media",
  },
  {
    name: "RationalWiki",
    displayName: "RationalWiki",
    icon: <PiBrain style={{ marginRight: "2px" }} />,
    description: "16 y/o atheist articles",
    isGroupStart: true,
    path: "/rational",
  },
  {
    name: "Fandom",
    displayName: "Fandom",
    icon: <SiFandom style={{ marginRight: "2px" }} />,
    description: "Fan-written articles",
    isGroupStart: true,
    path: "/fandom",
  },
  {
    name: "Bulbagarden",
    displayName: "Bulbagarden",
    icon: <GiGarlic style={{ marginRight: "2px" }} />,
    description: "Pokémon articles",
    isGroupStart: true,
    path: "/pokemon",
  },
  {
    name: "Know Your Meme",
    displayName: "Know Your Meme",
    icon: <FaRegLaughBeam style={{ marginRight: "2px" }} />,
    description: "Memes and internet culture",
    isGroupStart: true,
    path: "/memez",
  },
  {
    name: "Illogicopedia",
    displayName: "Illogicopedia",
    icon: <GiBanana style={{ marginRight: "2px" }} />,
    description: "Nonsensical articles (1)",
    isGroupStart: true,
    path: "/illogic",
  },
  {
    name: "Uncyclopedia",
    displayName: "Uncyclopedia",
    icon: <GiPotato style={{ marginRight: "2px" }} />,
    description: "Nonsensical articles (2)",
    isGroupStart: true,
    path: "/uncyclo",
  },
  {
    name: "Conservapedia",
    displayName: "Conservapedia",
    icon: <GiUsaFlag style={{ marginRight: "2px" }} />,
    description: "Far right articles (VERY SLOW)",
    isGroupStart: true,
    path: "/trump",
  },
  {
    name: "Wikivoyage",
    displayName: "Wikivoyage",
    icon: <SiWikivoyage />,
    description: "Travel info",
    isGroupStart: true,
    path: "/voyage",
  },
  {
    name: "Wikispecies",
    displayName: "Wikispecies",
    icon: <SiAnimalplanet />,
    description: "Species data",
    isGroupStart: true,
    path: "/species",
  },
  {
    name: "Wikinews",
    displayName: "Wikinews",
    icon: <IoEarth />,
    description: "News articles",
    isGroupStart: true,
    path: "/news",
  },
  {
    name: "SCP Foundation",
    displayName: "SCP Foundation",
    icon: <SiScpfoundation />,
    description: "Anomaly containment articles",
    isGroupStart: true,
    path: "/scp",
  },
  {
    name: "UNOP Chronicles",
    displayName: "UNOP Chronicles",
    icon: <FaSpaceShuttle />,
    description: "Articles from the future",
    isGroupStart: true,
    path: "/unop",
  },
  {
    name: "Edramatica",
    displayName: "Edramatica",
    icon: <TbRating21Plus style={{ marginRight: "2px" }} />,
    description: "Edgy internet articles (NSFW)",
    isGroupStart: true,
    path: "/edramatica",
  },
  {
    name: "Metapedia",
    displayName: "Metapedia",
    icon: <GiCaesar style={{ marginRight: "2px" }} />,
    description: "Neo-nazi articles",
    isGroupStart: true,
    path: "/sigma",
  },
  {
    name: "IncelWiki",
    displayName: "IncelWiki",
    icon: <ImMan style={{ marginRight: "2px" }} />,
    description: "Involuntary celibacy articles",
    isGroupStart: true,
    path: "/incel",
  },
  {
    name: "Pornopedia",
    displayName: "Pornopedia",
    icon: <TbRating18Plus style={{ marginRight: "2px" }} />,
    description: "self-explanatory",
    isGroupStart: true,
    path: "/xxx",
  },

  {
    name: "Polandball Wiki",
    displayName: "Polandball Wiki",
    icon: <GiPlainCircle style={{ marginRight: "2px" }} />,
    description: "Wikipedia but with countryballs",
    isGroupStart: true,
    path: "/polandball",
  },
  {
    name: "Polcompball Wiki",
    displayName: "Polcompball Wiki",
    icon: <PiGridFourLight style={{ marginRight: "2px" }} />,
    description: "Political ideology articles",
    isGroupStart: false,
    path: "/polcompball",
  },
  {
    name: "PolcompballAnarchy",
    displayName: "PolcompballAnarchy",
    icon: <PiSquaresFourThin style={{ marginRight: "2px" }} />,
    description: "'political' 'ideologies'",
    isGroupStart: false,
    path: "/polcompballanarchy",
  },
  {
    name: "Heterodontosaurus Balls",
    displayName: "Heterodontosaurus Balls",
    icon: <IoPlanet style={{ marginRight: "2px" }} />,
    description: "Opinionated neocon articles",
    isGroupStart: false,
    path: "/balls",
  },
  {
    name: "Micronations",
    displayName: "Micronations",
    icon: <RiGlobeLine style={{ marginRight: "2px" }} />,
    description: "Micronations articles",
    isGroupStart: true,
    path: "/micronations",
  },
  {
    name: "Wikisource",
    displayName: "Wikisource",
    icon: <GiIceberg style={{ marginRight: "2px" }} />,
    description: "Source texts",
    isGroupStart: true,
    path: "/source",
  },
  {
    name: "EverybodyWiki",
    displayName: "EverybodyWiki",
    icon: <MdPeopleAlt style={{ marginRight: "2px" }} />,
    description: "Autobiographies and more",
    isGroupStart: true,
    path: "/everybodywiki",
  },
  {
    name: "Wikihow",
    displayName: "Wikihow",
    icon: <MdOutlineQuestionMark style={{ marginRight: "2px" }} />,
    description: "How-to guides",
    isGroupStart: true,
    path: "/how",
  },
  {
    name: "Wikidata",
    displayName: "Wikidata",
    icon: <SiWikidata />,
    description: "Data items",
    isGroupStart: true,
    path: "/data",
  },
  {
    name: "Wikibooks",
    displayName: "Wikibooks",
    icon: <SiWikibooks />,
    description: "Books",
    isGroupStart: true,
    path: "/books",
  },
];

export const sourcesMap = Object.fromEntries(
  sourceOptionsImport.map((s) => [
    s.name.toLowerCase().replace(/ /g, "_").replace(/[()]/g, ""),
    s.name,
  ])
);
