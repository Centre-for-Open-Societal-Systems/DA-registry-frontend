// Static sample hierarchy for the location step. Replace with an API-backed
// lookup once the backend module is scaffolded.
export interface Woreda {
  name: string;
  kebeles: string[];
}

export interface Zone {
  name: string;
  woredas: Woreda[];
}

export interface Region {
  name: string;
  zones: Zone[];
}

export const REGIONS: Region[] = [
  {
    name: "Oromia",
    zones: [
      {
        name: "East Shewa",
        woredas: [
          { name: "Adama woreda", kebeles: ["Kebele 01", "Kebele 02", "Kebele 03", "Wonji Gefersa"] },
          { name: "Lume", kebeles: ["Ejere", "Koka", "Tulu Re'e"] },
          { name: "Boset", kebeles: ["Welenchiti", "Bofa", "Sifa"] },
        ],
      },
      {
        name: "West Arsi",
        woredas: [
          { name: "Shashamane", kebeles: ["Awasho", "Bulchana", "Kuyera"] },
          { name: "Arsi Negele", kebeles: ["Gubeta Arjo", "Kersa Ilala"] },
        ],
      },
    ],
  },
  {
    name: "Amhara",
    zones: [
      {
        name: "North Shewa",
        woredas: [
          { name: "Debre Berhan", kebeles: ["Kebele 01", "Kebele 04", "Kebele 07"] },
          { name: "Basona Werana", kebeles: ["Angolela", "Keyit", "Gudo Beret"] },
        ],
      },
      {
        name: "South Gondar",
        woredas: [
          { name: "Fogera", kebeles: ["Woreta Zuria", "Kidist Hana", "Nabega"] },
        ],
      },
    ],
  },
  {
    name: "SNNPR",
    zones: [
      {
        name: "Sidama",
        woredas: [
          { name: "Dale", kebeles: ["Yirgalem Zuria", "Soyama", "Wera"] },
          { name: "Aleta Wondo", kebeles: ["Bokaso", "Chume", "Titira"] },
        ],
      },
    ],
  },
  {
    name: "Tigray",
    zones: [
      {
        name: "Central Tigray",
        woredas: [
          { name: "Adwa", kebeles: ["Mariam Shewito", "Endabagerima"] },
        ],
      },
    ],
  },
];
