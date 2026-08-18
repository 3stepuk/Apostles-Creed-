import { CreedArticle } from '../types';

export const FULL_APOSTLES_CREED_ENGLISH = `I believe in God, the Father almighty, Creator of heaven and earth,
and in Jesus Christ, his only Son, our Lord,
who was conceived by the Holy Spirit, born of the Virgin Mary,
suffered under Pontius Pilate, was crucified, died and was buried;
he descended into hell; on the third day he rose again from the dead;
he ascended into heaven, and is seated at the right hand of God the Father almighty;
from there he will come to judge the living and the dead.
I believe in the Holy Spirit,
the holy catholic Church, the communion of saints,
the forgiveness of sins,
the resurrection of the body,
and life everlasting. Amen.`;

export const FULL_APOSTLES_CREED_LATIN = `Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae.
Et in Iesum Christum, Filium eius unicum, Dominum nostrum,
qui conceptus est de Spiritu Sancto, natus ex Maria Virgine,
passus sub Pontio Pilato, crucifixus, mortuus, et sepultus,
descendit ad inferos, tertia die resurrexit a mortuis,
ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis,
inde venturus est iudicare vivos et mortuos.
Credo in Spiritum Sanctum,
sanctam Ecclesiam catholicam, sanctorum communionem,
remissionem peccatorum,
carnis resurrectionem,
vitam aeternam. Amen.`;

export const CREED_ARTICLES: CreedArticle[] = [
  {
    id: 1,
    number: 1,
    traditionalApostle: 'St. Peter',
    apostleSymbol: 'Keys of Heaven',
    trinitarianSection: 'Father',
    textEnglish: 'I believe in God, the Father almighty, Creator of heaven and earth,',
    textLatin: 'Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae,',
    theologicalSummary: 'Affirms absolute monotheism, God\'s paternal relation to creation, omnipotence, and creation ex nihilo.',
    keyDogmas: ['Divine Omnipotence', 'Creation Ex Nihilo', 'Divine Paternity', 'Transcendence & Immanence'],
    cccReferences: [
      { section: 'CCC 198-231', description: '"I Believe in God" — The confession of God\'s oneness and supreme authority.' },
      { section: 'CCC 268-278', description: '"The Almighty" — Nothing is impossible with God; His power is loving, universal, and righteous.' },
      { section: 'CCC 279-324', description: '"Creator of Heaven and Earth" — The visible and invisible cosmos made from nothing out of pure love.' }
    ],
    scriptureReferences: [
      { verse: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth.' },
      { verse: 'Deuteronomy 6:4', text: 'Hear, O Israel: The LORD our God, the LORD is one.' },
      { verse: 'Luke 1:37', text: 'For with God nothing will be impossible.' }
    ],
    deepExegesis: {
      historicalContext: 'In the Greco-Roman pagan milieu of multiple competing deities, professing faith in ONE omnipotent Father was a radical act of spiritual revolution and total allegiance.',
      greekLatinRoots: [
        { term: 'Credo', origin: 'Latin (cor + do)', meaning: 'Literally "I give my heart / I entrust my life to".' },
        { term: 'Pantokrator (παντοκράτωρ)', origin: 'Greek', meaning: 'The Almighty, Ruler over all reality, sustaining the cosmos in being.' },
        { term: 'Ex Nihilo', origin: 'Latin theological phrase', meaning: 'Out of nothing — God did not fashion creation from pre-existing chaos, but spoke it into existence.' }
      ],
      rosaryMeditation: 'At the Crucifix of the Rosary, you anchor your entire soul in the foundational ground of all existence before entering the Marian mysteries.',
      memoryHook: 'Peter begins the foundation with the Rock of monotheism: God + Father + Almighty + Creator.'
    },
    keywordsToTest: ['believe', 'God', 'Father', 'almighty', 'Creator', 'heaven', 'earth']
  },
  {
    id: 2,
    number: 2,
    traditionalApostle: 'St. Andrew',
    apostleSymbol: 'X-Shaped Cross',
    trinitarianSection: 'Son',
    textEnglish: 'and in Jesus Christ, his only Son, our Lord,',
    textLatin: 'et in Iesum Christum, Filium eius unicum, Dominum nostrum,',
    theologicalSummary: 'Affirms the divinity of Jesus, his eternal Sonship within the Trinity, and His sovereign Lordship (Kyrios).',
    keyDogmas: ['Eternal Sonship', 'Messiahship (Christos/Anointed)', 'Sovereign Lordship (Kyrios)'],
    cccReferences: [
      { section: 'CCC 430-435', description: '"Jesus" — God saves. The Holy Name possessing divine power and redemption.' },
      { section: 'CCC 436-440', description: '"Christ" — The Anointed Priest, Prophet, and King fulfilling the Old Testament.' },
      { section: 'CCC 441-451', description: '"Only Son" & "Our Lord" — The eternal Word made flesh and supreme Master of our lives.' }
    ],
    scriptureReferences: [
      { verse: 'Matthew 16:16', text: 'Simon Peter replied, "You are the Christ, the Son of the living God."' },
      { verse: 'Philippians 2:11', text: 'And every tongue confess that Jesus Christ is Lord, to the glory of God the Father.' },
      { verse: 'John 3:16', text: 'For God so loved the world, that he gave his only Son...' }
    ],
    deepExegesis: {
      historicalContext: 'In the early Church, proclaiming "Jesus is Lord" (Kyrios) was a direct counter-claim to the Roman imperial mandate "Caesar is Lord". It meant Christ is our ultimate master.',
      greekLatinRoots: [
        { term: 'Yeshua (ישוע)', origin: 'Hebrew', meaning: 'Yahweh is Salvation.' },
        { term: 'Christos (χριστός)', origin: 'Greek', meaning: 'Anointed One (translation of Hebrew Mashiach / Messiah).' },
        { term: 'Monogenes (μονογενής)', origin: 'Greek', meaning: 'Only-begotten, unique, sharing the exact same divine nature.' }
      ],
      rosaryMeditation: 'In every decade of the Rosary, the name of Jesus is the hinge of the Hail Mary ("...and blessed is the fruit of thy womb, Jesus").',
      memoryHook: 'Andrew introduces the four titles: Jesus (name) + Christ (office) + Only Son (nature) + Our Lord (sovereignty).'
    },
    keywordsToTest: ['Jesus', 'Christ', 'only', 'Son', 'Lord']
  },
  {
    id: 3,
    number: 3,
    traditionalApostle: 'St. James the Greater',
    apostleSymbol: 'Scallop Shell & Pilgrim Staff',
    trinitarianSection: 'Son',
    textEnglish: 'who was conceived by the Holy Spirit, born of the Virgin Mary,',
    textLatin: 'qui conceptus est de Spiritu Sancto, natus ex Maria Virgine,',
    theologicalSummary: 'The mystery of the Incarnation: True God and True Man through the virginal conception.',
    keyDogmas: ['The Incarnation', 'Virginal Conception', 'Theotokos / Mary Mother of God', 'Hypostatic Union'],
    cccReferences: [
      { section: 'CCC 456-483', description: '"The Incarnation" — Why the Word became flesh: to save us, show God\'s love, be our model of holiness, and make us partakers in divine nature.' },
      { section: 'CCC 484-511', description: '"Conceived by the Holy Spirit, Born of the Virgin Mary" — The Annunciation, Fiat, and perpetual virginity.' }
    ],
    scriptureReferences: [
      { verse: 'Luke 1:35', text: 'The Holy Spirit will come upon you, and the power of the Most High will overshadow you; therefore the child to be born will be called holy—the Son of God.' },
      { verse: 'Isaiah 7:14', text: 'Behold, the virgin shall conceive and bear a son, and shall call his name Immanuel.' }
    ],
    deepExegesis: {
      historicalContext: 'Combats Docetism (which falsely claimed Jesus only appeared to have a real physical body) and Gnosticism (which despised physical flesh). God embraced real human flesh.',
      greekLatinRoots: [
        { term: 'Incarnatio', origin: 'Latin (in + caro/carnis)', meaning: 'Enfleshment — God the Word becoming bodily human.' },
        { term: 'Theotokos (θεοτόκος)', origin: 'Greek (Council of Ephesus 431 AD)', meaning: 'God-bearer / Mother of God.' }
      ],
      rosaryMeditation: 'Directly mirrors the 1st Joyful Mystery (The Annunciation) where Mary spoke her Fiat ("Let it be done to me according to your word").',
      memoryHook: 'Conceived (by Spirit) -> Born (of Mary): Divine origin meeting earthly motherhood.'
    },
    keywordsToTest: ['conceived', 'Holy', 'Spirit', 'born', 'Virgin', 'Mary']
  },
  {
    id: 4,
    number: 4,
    traditionalApostle: 'St. John',
    apostleSymbol: 'Chalice & Eagle',
    trinitarianSection: 'Son',
    textEnglish: 'suffered under Pontius Pilate, was crucified, died and was buried;',
    textLatin: 'passus sub Pontio Pilato, crucifixus, mortuus, et sepultus,',
    theologicalSummary: 'Historical reality of Christ\'s Passion, atonement, authentic physical death, and burial.',
    keyDogmas: ['Historical Anchoring (Pontius Pilate)', 'Redemptive Atonement', 'True Death & True Humanity'],
    cccReferences: [
      { section: 'CCC 571-605', description: '"Jesus and Israel" — The historical circumstances of Jesus\' rejection and offering.' },
      { section: 'CCC 606-618', description: '"Christ Offered Himself" — The Paschal sacrifice for the sins of the whole world.' },
      { section: 'CCC 624-630', description: '"Jesus Christ was Buried" — The Sabbath rest in the tomb and real physical passing.' }
    ],
    scriptureReferences: [
      { verse: '1 Corinthians 15:3-4', text: 'Christ died for our sins in accordance with the Scriptures, that he was buried, that he was raised on the third day...' },
      { verse: 'John 19:30', text: 'When Jesus had received the sour wine, he said, "It is finished," and he bowed his head and gave up his spirit.' }
    ],
    deepExegesis: {
      historicalContext: 'Pontius Pilate is explicitly named to anchor Christianity in datable human history (Roman governor of Judea 26–36 AD), showing Christian faith is historical fact, not abstract mythology.',
      greekLatinRoots: [
        { term: 'Passio', origin: 'Latin (pati = to endure, suffer)', meaning: 'Enduring out of love; voluntary surrender to suffering.' },
        { term: 'Crucifixus', origin: 'Latin (cruci fixus)', meaning: 'Fastened to the cross — the most degrading Roman slave execution transformed into the throne of redemption.' }
      ],
      rosaryMeditation: 'Summarizes all five Sorrowful Mysteries: Agony, Scourging, Crowning with Thorns, Carrying of the Cross, and Crucifixion.',
      memoryHook: 'Four rapid historical verbs: Suffered -> Crucified -> Died -> Buried.'
    },
    keywordsToTest: ['suffered', 'Pontius', 'Pilate', 'crucified', 'died', 'buried']
  },
  {
    id: 5,
    number: 5,
    traditionalApostle: 'St. Thomas',
    apostleSymbol: 'Spear & Carpenter Square',
    trinitarianSection: 'Son',
    textEnglish: 'he descended into hell; on the third day he rose again from the dead;',
    textLatin: 'descendit ad inferos, tertia die resurrexit a mortuis,',
    theologicalSummary: 'The Harrowing of Hell (Sheol/Hades) liberating righteous souls, and the supreme historical reality of the Resurrection.',
    keyDogmas: ['The Descent to the Realm of the Dead', 'The Resurrection on the Third Day', 'Victory over Death & Satan'],
    cccReferences: [
      { section: 'CCC 631-637', description: '"Christ Descended into Hell" — Preaching the Gospel to the spirits in prison and unlocking heaven for the just from Adam onward.' },
      { section: 'CCC 638-658', description: '"On the Third Day He Rose Again" — The central cornerstone and proof of the Christian faith.' }
    ],
    scriptureReferences: [
      { verse: '1 Peter 3:18-19', text: 'Being put to death in the flesh but made alive in the spirit, in which he went and proclaimed to the spirits in prison.' },
      { verse: 'Luke 24:5-6', text: 'Why do you seek the living among the dead? He is not here, but has risen!' }
    ],
    deepExegesis: {
      historicalContext: '"Hell" here does not mean Gehenna (the damned), but Sheol/Hades (inferos = the realm of the dead). Christ descended as conqueror to deliver Abraham, Moses, and the righteous ancients.',
      greekLatinRoots: [
        { term: 'Inferos / Sheol (שאול)', origin: 'Latin/Hebrew', meaning: 'The abode of the dead awaiting the Redeemer.' },
        { term: 'Resurrectio / Anastasis (ἀνάστασις)', origin: 'Greek', meaning: 'Standing up again; bodily rising to an immortal, transfigured state.' }
      ],
      rosaryMeditation: 'Directly corresponds to the 1st Glorious Mystery (The Resurrection), the dawn of the new eternal creation.',
      memoryHook: 'Descent below (descended into hell) -> Ascent above (on third day rose from the dead).'
    },
    keywordsToTest: ['descended', 'hell', 'third', 'day', 'rose', 'dead']
  },
  {
    id: 6,
    number: 6,
    traditionalApostle: 'St. James the Lesser',
    apostleSymbol: 'Fuller\'s Club',
    trinitarianSection: 'Son',
    textEnglish: 'he ascended into heaven, and is seated at the right hand of God the Father almighty;',
    textLatin: 'ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis,',
    theologicalSummary: 'Christ\'s bodily entrance into divine glory, high priestly intercession, and supreme reign with the Father.',
    keyDogmas: ['The Ascension', 'Session at the Right Hand', 'Eternal Heavenly Intercession'],
    cccReferences: [
      { section: 'CCC 659-667', description: '"Jesus Ascended into Heaven" — Humanity is permanently taken up into the intimate inner life of the Godhead.' }
    ],
    scriptureReferences: [
      { verse: 'Acts 1:9', text: 'As they were looking on, he was lifted up, and a cloud took him out of their sight.' },
      { verse: 'Hebrews 7:25', text: 'Consequently, he is able to save to the uttermost those who draw near to God through him, since he always lives to make intercession for them.' }
    ],
    deepExegesis: {
      historicalContext: '"Sitting at the right hand" is royal Semitic terminology for sharing supreme executive authority and power alongside the sovereign king.',
      greekLatinRoots: [
        { term: 'Dextera Dei', origin: 'Latin', meaning: 'The right hand of God — place of preeminent honor, judicial power, and favor.' },
        { term: 'Ascensio', origin: 'Latin', meaning: 'Going up by one\'s own divine power.' }
      ],
      rosaryMeditation: 'The 2nd Glorious Mystery (The Ascension). Christ is our high priest presenting our prayers before the Father.',
      memoryHook: 'Ascended -> Seated: The journey up to the right hand of power.'
    },
    keywordsToTest: ['ascended', 'heaven', 'seated', 'right', 'hand', 'Father', 'almighty']
  },
  {
    id: 7,
    number: 7,
    traditionalApostle: 'St. Philip',
    apostleSymbol: 'Basket & Cross',
    trinitarianSection: 'Son',
    textEnglish: 'from there he will come to judge the living and the dead.',
    textLatin: 'inde venturus est iudicare vivos et mortuos.',
    theologicalSummary: 'The Parousia (Second Coming), final universal judgment, and fulfillment of cosmic justice.',
    keyDogmas: ['The Second Coming (Parousia)', 'Universal & Particular Judgment', 'Vindication of Justice'],
    cccReferences: [
      { section: 'CCC 668-682', description: '"From Thence He Will Come to Judge" — The final trial, cosmic separation of good and evil, and public vindication of God\'s truth.' }
    ],
    scriptureReferences: [
      { verse: 'Matthew 25:31-32', text: 'When the Son of Man comes in his glory, and all the angels with him, then he will sit on his glorious throne. Before him will be gathered all the nations...' },
      { verse: '2 Timothy 4:1', text: 'I charge you in the presence of God and of Christ Jesus, who is to judge the living and the dead...' }
    ],
    deepExegesis: {
      historicalContext: 'Assures persecuted believers throughout history that evil and injustice will not have the final word; every secret deed and heart\'s intent will be brought into the light.',
      greekLatinRoots: [
        { term: 'Parousia (παρουσία)', origin: 'Greek', meaning: 'Physical arrival, royal state visit of the King of Kings.' },
        { term: 'Iudicare', origin: 'Latin', meaning: 'To discern, separate, and render definitive justice.' }
      ],
      rosaryMeditation: 'Inspires holy vigilance, examination of conscience, and reliance on divine mercy while praying the Rosary.',
      memoryHook: 'From there -> Will come -> To judge -> Living & Dead.'
    },
    keywordsToTest: ['come', 'judge', 'living', 'dead']
  },
  {
    id: 8,
    number: 8,
    traditionalApostle: 'St. Bartholomew',
    apostleSymbol: 'Flaying Knife',
    trinitarianSection: 'Holy Spirit',
    textEnglish: 'I believe in the Holy Spirit,',
    textLatin: 'Credo in Spiritum Sanctum,',
    theologicalSummary: 'The third Divine Person of the Blessed Trinity, Lord and Giver of Life, inspiring the Church and sanctifying souls.',
    keyDogmas: ['Divinity of the Holy Spirit', 'Sanctification of the Faithful', 'Indwelling Advocate (Paraclete)'],
    cccReferences: [
      { section: 'CCC 683-747', description: '"I Believe in the Holy Spirit" — The Spirit reveals the Son and Father, imparts gifts and charisms, and animates the Body of Christ.' }
    ],
    scriptureReferences: [
      { verse: 'John 14:26', text: 'But the Helper, the Holy Spirit, whom the Father will send in my name, he will teach you all things and bring to your remembrance all that I have said to you.' },
      { verse: 'Romans 8:26', text: 'Likewise the Spirit helps us in our weakness. For we do not know what to pray for as we ought, but the Spirit himself intercedes for us with groanings too deep for words.' }
    ],
    deepExegesis: {
      historicalContext: 'Shifts the creed from Christology (Son) into Pneumatology (Spirit) and Ecclesiology (Church as the Spirit\'s temple).',
      greekLatinRoots: [
        { term: 'Ruach (רוח) / Pneuma (πνεῦμα)', origin: 'Hebrew / Greek', meaning: 'Breath, Wind, Dynamic Divine Life-Force.' },
        { term: 'Parakletos (παράκλητος)', origin: 'Greek', meaning: 'Advocate, consoler, one called alongside to defend and guide.' }
      ],
      rosaryMeditation: 'The 3rd Glorious Mystery (The Descent of the Holy Spirit at Pentecost), igniting the apostles with apostolic fire.',
      memoryHook: 'The second "I believe": Peter opened with "I believe in God", Bartholomew renews "I believe in the Holy Spirit".'
    },
    keywordsToTest: ['believe', 'Holy', 'Spirit']
  },
  {
    id: 9,
    number: 9,
    traditionalApostle: 'St. Matthew',
    apostleSymbol: 'Winged Man / Coin Bag',
    trinitarianSection: 'Holy Spirit',
    textEnglish: 'the holy catholic Church, the communion of saints,',
    textLatin: 'sanctam Ecclesiam catholicam, sanctorum communionem,',
    theologicalSummary: 'The Mystical Body of Christ across all nations (Catholic) and the solidarity of prayer linking the Church Triumphant (Heaven), Penitent (Purgatory), and Militant (Earth).',
    keyDogmas: ['Four Marks: One, Holy, Catholic, Apostolic', 'Mystical Body of Christ', 'Communion of Saints (Triumphant, Expectant, Militant)'],
    cccReferences: [
      { section: 'CCC 748-810', description: '"The Church in God\'s Plan" — People of God, Body of Christ, Temple of the Holy Spirit.' },
      { section: 'CCC 830-856', description: '"The Church is Catholic" — Universal across time, space, and cultures.' },
      { section: 'CCC 946-962', description: '"Communion of Saints" — Sharing in holy things (sacraments) and among holy persons.' }
    ],
    scriptureReferences: [
      { verse: 'Ephesians 5:25-27', text: 'Christ loved the church and gave himself up for her, that he might sanctify her...' },
      { verse: 'Hebrews 12:1', text: 'Since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight...' },
      { verse: '1 Corinthians 12:26', text: 'If one member suffers, all suffer together; if one member is honored, all rejoice together.' }
    ],
    deepExegesis: {
      historicalContext: '"Catholic" comes from Greek *kath\' holon* ("according to the whole"), first coined by St. Ignatius of Antioch in 110 AD to designate the authentic worldwide apostolic community in contrast to splinter sects.',
      greekLatinRoots: [
        { term: 'Katholikos (καθολικός)', origin: 'Greek', meaning: 'Universal, complete, bearing the fullness of truth for all peoples.' },
        { term: 'Koinonia (κοινωνία)', origin: 'Greek', meaning: 'Intimate spiritual communion, fellowship, and mutual participation in grace.' }
      ],
      rosaryMeditation: 'When we pray the Rosary with the Blessed Mother and the saints, we actively participate in the Communion of Saints.',
      memoryHook: 'Two parts: The Church on earth (holy catholic Church) + The family across eternity (communion of saints).'
    },
    keywordsToTest: ['holy', 'catholic', 'Church', 'communion', 'saints']
  },
  {
    id: 10,
    number: 10,
    traditionalApostle: 'St. Simon the Zealot',
    apostleSymbol: 'Fish & Saw',
    trinitarianSection: 'Holy Spirit',
    textEnglish: 'the forgiveness of sins,',
    textLatin: 'remissionem peccatorum,',
    theologicalSummary: 'Sacramental reconciliation through Baptism and Confession, washing away guilt and restoring divine friendship.',
    keyDogmas: ['Efficacy of Baptism & Penance', 'Infinite Divine Mercy', 'Total Remission of Guilt'],
    cccReferences: [
      { section: 'CCC 976-987', description: '"The Forgiveness of Sins" — Entrusted to the Apostles through Baptism and the power of the Keys.' }
    ],
    scriptureReferences: [
      { verse: 'John 20:22-23', text: 'Receive the Holy Spirit. If you forgive the sins of any, they are forgiven them; if you withhold forgiveness from any, it is withheld.' },
      { verse: '1 John 1:9', text: 'If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.' }
    ],
    deepExegesis: {
      historicalContext: 'Guarantees that no sin is beyond the reach of Christ\'s precious Blood when sought with a contrite heart, combating early Novatianist and Donatist despair.',
      greekLatinRoots: [
        { term: 'Remissio', origin: 'Latin (re + mittere)', meaning: 'Sending away, release from debt, total cancellation of moral debt.' },
        { term: 'Aphesis (ἄφεσις)', origin: 'Greek', meaning: 'Liberation, pardon, setting a captive free.' }
      ],
      rosaryMeditation: 'The Fatima Prayer between decades ("O My Jesus, forgive us our sins, save us from the fires of hell...") echoes this article.',
      memoryHook: 'Short and powerful: The Forgiveness of Sins.'
    },
    keywordsToTest: ['forgiveness', 'sins']
  },
  {
    id: 11,
    number: 11,
    traditionalApostle: 'St. Jude Thaddaeus',
    apostleSymbol: 'Club & Medallion of Christ',
    trinitarianSection: 'Holy Spirit',
    textEnglish: 'the resurrection of the body,',
    textLatin: 'carnis resurrectionem,',
    theologicalSummary: 'The physical, bodily reconstitution and glorification of human flesh at the end of time, not mere disembodied soul survival.',
    keyDogmas: ['Bodily Resurrection (Carnis Resurrectionem)', 'Integrity of Human Nature (Body & Soul)', 'Glorified Bodies'],
    cccReferences: [
      { section: 'CCC 988-1019', description: '"The Resurrection of the Dead" — In death, the soul separates from the body, but in the resurrection God will give incorruptible life to our body.' }
    ],
    scriptureReferences: [
      { verse: '1 Corinthians 15:42-44', text: 'What is sown is perishable; what is raised is imperishable. It is sown in dishonor; it is raised in glory... It is sown a natural body; it is raised a spiritual body.' },
      { verse: 'Romans 8:11', text: 'He who raised Christ Jesus from the dead will also give life to your mortal bodies through his Spirit who dwells in you.' }
    ],
    deepExegesis: {
      historicalContext: 'The Latin Creed says *carnis resurrectionem* (literally "resurrection of the FLESH"). This specifically refutes pagan notions that the physical body is a temporary prison to be discarded.',
      greekLatinRoots: [
        { term: 'Caro / Carnis', origin: 'Latin', meaning: 'Flesh, the tangible physical matter of human embodiment.' },
        { term: 'Soma Pneumatikon (σῶμα πνευματικόν)', origin: 'Greek (St. Paul)', meaning: 'A glorified spiritual body, real yet immune to decay and suffering.' }
      ],
      rosaryMeditation: 'The 4th Glorious Mystery (The Assumption of Mary) is the pledge and foretaste of our own bodily resurrection in Christ.',
      memoryHook: 'The promise of our future: The Resurrection of the Body.'
    },
    keywordsToTest: ['resurrection', 'body']
  },
  {
    id: 12,
    number: 12,
    traditionalApostle: 'St. Matthias',
    apostleSymbol: 'Axe & Open Bible',
    trinitarianSection: 'Holy Spirit',
    textEnglish: 'and life everlasting. Amen.',
    textLatin: 'vitam aeternam. Amen.',
    theologicalSummary: 'The Beatific Vision: eternal communion of uninterrupted love and joy with the Holy Trinity in the new creation.',
    keyDogmas: ['The Beatific Vision', 'Eternal Life (Zoe Aionios)', 'Final Seal: Amen ("It is truly so")'],
    cccReferences: [
      { section: 'CCC 1020-1060', description: '"Life Everlasting" — Particular judgment, Heaven, Purgatory, Hell, and the Last Judgment.' },
      { section: 'CCC 1061-1065', description: '"Amen" — The Hebrew response affirming certainty, trust, and our personal signature on God\'s covenant.' }
    ],
    scriptureReferences: [
      { verse: 'Revelation 21:4', text: 'He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore...' },
      { verse: '1 John 5:20', text: 'He is the true God and eternal life.' }
    ],
    deepExegesis: {
      historicalContext: 'Concludes the entire pilgrimage of faith. "Amen" shares the Hebrew root with *Emunah* (faithfulness/firmness) — meaning "I stand firmly on this truth".',
      greekLatinRoots: [
        { term: 'Zoe Aionios (ζωὴ αἰώνιος)', origin: 'Greek', meaning: 'Life of the age to come — sharing in God\'s uncreated eternal vitality.' },
        { term: 'Amen (אָמֵן)', origin: 'Hebrew', meaning: 'Verily, let it be so, I stake my life upon this truth.' }
      ],
      rosaryMeditation: 'The 5th Glorious Mystery (The Coronation of Our Lady and Glory of all the Saints in Heaven).',
      memoryHook: 'The ultimate climax: Life Everlasting + Amen.'
    },
    keywordsToTest: ['life', 'everlasting', 'Amen']
  }
];

export const ROSARY_OPENING_PRAYERS = [
  {
    order: 1,
    bead: 'Crucifix',
    prayer: 'Sign of the Cross & Apostles\' Creed',
    purpose: 'Profession of the Catholic Faith, setting the theological foundation for all mysteries.',
    instruction: 'Hold the Crucifix in your hand. Make the Sign of the Cross and recite the Apostles\' Creed.'
  },
  {
    order: 2,
    bead: 'First Large Bead',
    prayer: 'The Our Father (Pater Noster)',
    purpose: 'Prayer of divine adoption and filiation taught by Christ.',
    instruction: 'Pray 1 Our Father for the intentions of the Holy Father and the universal Church.'
  },
  {
    order: 3,
    bead: 'Three Small Beads',
    prayer: 'Three Hail Marys (Ave Maria)',
    purpose: 'Increase in the theological virtues: 1. Faith, 2. Hope, 3. Charity (Love).',
    instruction: 'Recite 3 Hail Marys meditating on the increase of Faith, Hope, and Charity in your soul.'
  },
  {
    order: 4,
    bead: 'Chain / Space before Decades',
    prayer: 'Glory Be (Gloria Patri) & Fatima Prayer',
    purpose: 'Doxology to the Holy Trinity, concluding the opening preparation before announcing the First Mystery.',
    instruction: 'Recite the Glory Be and the Fatima Prayer before entering the first decade.'
  }
];

export const MEMORY_SCIENCE_PRINCIPLES = [
  {
    title: 'The Generation Effect & Testing Effect',
    researchers: 'Roediger & Karpicke (2006); Bjork (1994)',
    concept: 'Actively retrieving a word from memory produces far deeper neural encoding than passively reading the text 10 times.',
    howAppAppliesIt: 'Our interactive first-letter typing and cloze tests force your brain to generate each word from minimal cues.'
  },
  {
    title: 'Progressive Cue Fading (First-Letter Scaffolding)',
    researchers: 'Bahrick & Hall (1991); Baddeley (1997)',
    concept: 'Cognitive cues should be gradually stripped away as retention improves: Full text → First letter initials → Blanks → Free recall.',
    howAppAppliesIt: 'Switch effortlessly between 5 levels of fading scaffolding, allowing you to train with the initial letters (e.g. "I b i G...") until fully internalized.'
  },
  {
    title: 'Spaced Repetition System (SM-2 Algorithm)',
    researchers: 'Ebbinghaus Forgetting Curve; Wozniak (1990)',
    concept: 'Memory decays exponentially unless reviewed at expanding time intervals (1 day, 3 days, 7 days, 16 days, 35 days).',
    howAppAppliesIt: 'Our built-in SRS algorithm schedules reviews right at the moment of impending forgetting to maximize long-term retention into permanent semantic memory.'
  },
  {
    title: 'Cognitive Chunking & Dual Coding',
    researchers: 'George Miller (1956); Allan Paivio (1971)',
    concept: 'Working memory holds 4-7 chunks. Organizing into the 12 Apostolic Articles across 3 Trinitarian movements creates structural mental schema.',
    howAppAppliesIt: 'Articles are color-coded and structured into Father, Son, and Holy Spirit with apostle symbols and Latin counterparts.'
  },
  {
    title: 'Elaborative Encoding (Levels of Processing)',
    researchers: 'Craik & Lockhart (1972)',
    concept: 'Deeper semantic understanding (Why was Pilate named? What does "inferos" mean?) makes words stick 300% longer than mechanical rote repetition.',
    howAppAppliesIt: 'Deep theological exegesis, Catechism citations, and Greek/Latin roots give every phrase profound spiritual resonance.'
  }
];

export { CREED_PHRASE_EXPLANATIONS } from './phraseExplanationsData';

