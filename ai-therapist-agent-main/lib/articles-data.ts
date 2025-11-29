export interface Article {
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  content: {
    introduction: string;
    sections: {
      title: string;
      content: string;
    }[];
    conclusion: string;
    resources?: {
      title: string;
      url: string;
    }[];
  };
}

export const articles: Article[] = [
  {
    slug: "depression-comprendre-et-agir",
    title: "Dépression : comprendre et agir",
    description: "La dépression est un trouble mental courant mais sérieux. Découvrez comment la reconnaître et les solutions pour en sortir.",
    image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&h=600&fit=crop&q=80",
    category: "Santé mentale",
    author: "Équipe Theramind",
    date: "15 novembre 2024",
    readTime: "8 min",
    content: {
      introduction: "La dépression est l'un des troubles mentaux les plus répandus dans le monde, touchant plus de 264 millions de personnes. Elle se caractérise par une tristesse persistante, une perte d'intérêt pour les activités habituellement plaisantes, et peut avoir des répercussions importantes sur la vie quotidienne.",
      sections: [
        {
          title: "Qu'est-ce que la dépression ?",
          content: "La dépression est un trouble de l'humeur qui va bien au-delà d'un simple sentiment de tristesse passager. Elle se manifeste par une combinaison de symptômes émotionnels, cognitifs et physiques qui persistent pendant au moins deux semaines. Contrairement à une baisse de moral temporaire, la dépression affecte profondément le fonctionnement quotidien de la personne."
        },
        {
          title: "Les signes à reconnaître",
          content: "Les symptômes principaux incluent : une tristesse intense et persistante, une perte d'intérêt ou de plaisir pour les activités, des troubles du sommeil (insomnie ou hypersomnie), des changements d'appétit et de poids, une fatigue constante, des difficultés de concentration, des sentiments de culpabilité ou d'inutilité, et dans les cas graves, des pensées suicidaires. Il est important de noter que la dépression peut se manifester différemment selon les individus."
        },
        {
          title: "Les causes multiples",
          content: "La dépression résulte généralement d'une combinaison de facteurs biologiques, psychologiques et environnementaux. Les déséquilibres neurochimiques, l'hérédité, les événements de vie stressants, les traumatismes, certaines maladies physiques, et même certains médicaments peuvent contribuer à son développement. Comprendre ces facteurs aide à mieux adapter le traitement."
        },
        {
          title: "Les traitements efficaces",
          content: "Plusieurs approches thérapeutiques ont prouvé leur efficacité : la psychothérapie (notamment la thérapie cognitivo-comportementale), les médicaments antidépresseurs prescrits par un médecin, la combinaison des deux approches, l'activité physique régulière, une alimentation équilibrée, et le maintien d'une routine de sommeil saine. Le traitement doit être personnalisé selon chaque individu."
        },
        {
          title: "Comment aider et se faire aider",
          content: "Si vous pensez souffrir de dépression, il est crucial de consulter un professionnel de santé. N'hésitez pas à en parler à votre médecin traitant, un psychiatre ou un psychologue. Pour aider un proche, soyez à l'écoute sans jugement, encouragez-le à consulter, et soutenez-le dans son parcours de soin. La dépression se soigne, et avec un traitement adapté, la guérison est possible."
        }
      ],
      conclusion: "La dépression est un trouble sérieux mais traitable. Reconnaître les symptômes, comprendre les causes, et rechercher une aide professionnelle sont des étapes essentielles vers la guérison. N'oubliez pas : demander de l'aide est un signe de force, pas de faiblesse.",
      resources: [
        { title: "SOS Dépression Tunisie", url: "tel:80101919" },
        { title: "Urgences psychiatriques", url: "tel:71561329" }
      ]
    }
  },
  {
    slug: "anxiete-symptomes-et-solutions",
    title: "L'anxiété : symptômes et solutions",
    description: "L'anxiété peut devenir envahissante. Apprenez à identifier ses manifestations et découvrez des stratégies pour la gérer efficacement.",
    image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=1200&h=600&fit=crop&q=80",
    category: "Troubles anxieux",
    author: "Équipe Theramind",
    date: "10 novembre 2024",
    readTime: "7 min",
    content: {
      introduction: "L'anxiété est une réaction naturelle face au stress, mais lorsqu'elle devient excessive et persistante, elle peut se transformer en un trouble anxieux nécessitant une prise en charge. Environ 284 millions de personnes dans le monde sont touchées par des troubles anxieux.",
      sections: [
        {
          title: "Comprendre l'anxiété",
          content: "L'anxiété est un état d'inquiétude et de nervosité face à une menace réelle ou perçue. Elle se distingue de la peur normale par son intensité disproportionnée, sa persistance dans le temps, et son impact sur le fonctionnement quotidien. Les troubles anxieux regroupent plusieurs conditions, dont le trouble anxieux généralisé, le trouble panique, les phobies spécifiques, et l'anxiété sociale."
        },
        {
          title: "Les symptômes physiques et psychologiques",
          content: "Les manifestations physiques incluent : palpitations cardiaques, transpiration excessive, tremblements, tensions musculaires, maux de tête, troubles digestifs, et sensation d'oppression thoracique. Sur le plan psychologique : inquiétude constante, ruminations, difficultés de concentration, irritabilité, troubles du sommeil, et sentiment d'être dépassé. Ces symptômes peuvent varier en intensité et en fréquence."
        },
        {
          title: "Les déclencheurs courants",
          content: "Plusieurs facteurs peuvent déclencher ou aggraver l'anxiété : le stress professionnel, les problèmes relationnels, les difficultés financières, les changements de vie importants, la consommation de caféine ou d'alcool, le manque de sommeil, et certaines conditions médicales. Identifier ses déclencheurs personnels est une étape importante dans la gestion de l'anxiété."
        },
        {
          title: "Techniques de gestion immédiate",
          content: "Face à une crise d'anxiété, plusieurs techniques peuvent aider rapidement : la respiration profonde (inspirer sur 4 temps, retenir 4 temps, expirer sur 4 temps), l'ancrage sensoriel (nommer 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez), la relaxation musculaire progressive, et le mouvement physique. Ces outils simples peuvent être pratiqués n'importe où."
        },
        {
          title: "Traitements et approches à long terme",
          content: "Les thérapies cognitivo-comportementales (TCC) sont particulièrement efficaces pour l'anxiété. Elles aident à identifier et modifier les pensées anxiogènes. La méditation de pleine conscience, l'exercice physique régulier, une alimentation équilibrée, et dans certains cas, des médicaments prescrits par un médecin peuvent compléter le traitement. La thérapie d'exposition graduelle est également très utile pour les phobies spécifiques."
        }
      ],
      conclusion: "L'anxiété, bien que difficile à vivre, peut être efficacement gérée avec les bonnes stratégies et un accompagnement adapté. N'hésitez pas à consulter un professionnel si votre anxiété interfère avec votre vie quotidienne. Des solutions existent et fonctionnent.",
      resources: [
        { title: "Ligne d'écoute santé mentale", url: "tel:80101919" },
        { title: "Centre de santé mentale", url: "tel:71574800" }
      ]
    }
  },
  {
    slug: "meditation-pleine-conscience",
    title: "La méditation de pleine conscience",
    description: "La pleine conscience est une pratique millénaire validée par la science moderne. Découvrez ses bienfaits et comment débuter.",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&h=600&fit=crop&q=80",
    category: "Bien-être",
    author: "Équipe Theramind",
    date: "5 novembre 2024",
    readTime: "6 min",
    content: {
      introduction: "La méditation de pleine conscience, ou mindfulness, est une pratique ancestrale qui connaît un regain d'intérêt grâce aux nombreuses études scientifiques démontrant ses bienfaits sur la santé mentale et physique. Elle consiste à porter son attention sur le moment présent, sans jugement.",
      sections: [
        {
          title: "Qu'est-ce que la pleine conscience ?",
          content: "La pleine conscience est l'art de porter délibérément son attention sur l'expérience présente, moment après moment, avec ouverture et sans jugement. Contrairement à ce que beaucoup pensent, méditer ne signifie pas vider son esprit, mais plutôt observer ses pensées, émotions et sensations physiques avec bienveillance, comme un témoin neutre."
        },
        {
          title: "Les bienfaits prouvés scientifiquement",
          content: "De nombreuses études ont démontré les effets positifs de la méditation : réduction du stress et de l'anxiété, amélioration de la concentration et de la mémoire, diminution des symptômes dépressifs, renforcement du système immunitaire, meilleure régulation émotionnelle, amélioration de la qualité du sommeil, et même des changements structurels positifs dans le cerveau. Ces bénéfices apparaissent généralement après quelques semaines de pratique régulière."
        },
        {
          title: "Comment débuter la pratique",
          content: "Pour commencer, choisissez un moment calme de votre journée et un endroit confortable. Commencez par 5 minutes par jour. Asseyez-vous confortablement, le dos droit, fermez les yeux et concentrez-vous sur votre respiration. Observez les sensations de l'air qui entre et sort de vos narines. Lorsque votre esprit s'évade (ce qui est normal), ramenez doucement votre attention sur votre respiration, sans vous juger."
        },
        {
          title: "Les différentes techniques",
          content: "Il existe plusieurs approches de méditation de pleine conscience : la méditation assise (observation de la respiration), le body scan (balayage corporel), la méditation marchée, la méditation des sons, et la pratique informelle (pleine conscience dans les activités quotidiennes comme manger ou se laver). Expérimentez différentes techniques pour trouver celles qui vous conviennent le mieux."
        },
        {
          title: "Intégrer la pleine conscience au quotidien",
          content: "Au-delà des séances formelles, vous pouvez pratiquer la pleine conscience dans votre vie quotidienne : en mangeant consciemment (savourer chaque bouchée), en marchant attentivement, en écoutant pleinement lors de conversations, ou en effectuant des tâches ménagères en pleine présence. Ces micro-pratiques renforcent les bénéfices de la méditation formelle et vous ancrent dans le moment présent."
        }
      ],
      conclusion: "La méditation de pleine conscience est un outil puissant et accessible à tous. Quelques minutes par jour suffisent pour commencer à en ressentir les bienfaits. La clé est la régularité plutôt que la durée. Soyez patient et bienveillant avec vous-même dans cette pratique.",
      resources: [
        { title: "Application Theramind - Méditation guidée", url: "/activities" },
        { title: "Exercices de respiration", url: "/activities" }
      ]
    }
  },
  {
    slug: "burnout-prevention-accompagnement",
    title: "Burn-out : prévention et accompagnement",
    description: "Le burn-out touche de plus en plus de personnes. Apprenez à le reconnaître, le prévenir et retrouver votre équilibre.",
    image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=1200&h=600&fit=crop&q=80",
    category: "Santé au travail",
    author: "Équipe Theramind",
    date: "1er novembre 2024",
    readTime: "9 min",
    content: {
      introduction: "Le burn-out, ou syndrome d'épuisement professionnel, est reconnu par l'OMS comme un phénomène lié au travail. Il résulte d'un stress chronique au travail qui n'a pas été géré avec succès, menant à un épuisement physique, émotionnel et mental.",
      sections: [
        {
          title: "Qu'est-ce que le burn-out ?",
          content: "Le burn-out se caractérise par trois dimensions principales : un sentiment d'épuisement ou de fatigue extrême, une distanciation mentale vis-à-vis du travail (cynisme), et une réduction de l'efficacité professionnelle. Il ne survient pas du jour au lendemain mais résulte d'une accumulation progressive de stress professionnel non résolu. Contrairement à la fatigue normale, le repos ne suffit pas à récupérer."
        },
        {
          title: "Les signes d'alerte à ne pas ignorer",
          content: "Phase initiale : fatigue persistante, troubles du sommeil, tensions musculaires, maux de tête fréquents. Phase intermédiaire : irritabilité accrue, démotivation, cynisme, isolement social, difficultés de concentration, erreurs au travail. Phase avancée : épuisement total, sentiment d'échec constant, dépression, anxiété sévère, pensées suicidaires dans les cas graves. Plus le burn-out est détecté tôt, plus la récupération est rapide."
        },
        {
          title: "Les facteurs de risque",
          content: "Facteurs organisationnels : charge de travail excessive, manque d'autonomie, objectifs irréalistes, absence de reconnaissance, conflits de valeurs, climat social dégradé, insécurité de l'emploi. Facteurs individuels : perfectionnisme, difficulté à dire non, surinvestissement professionnel, manque de soutien social, antécédents de troubles anxieux ou dépressifs. L'interaction entre ces facteurs augmente le risque de burn-out."
        },
        {
          title: "Prévention et premiers secours",
          content: "Pour prévenir le burn-out : fixez des limites claires entre vie pro et perso, apprenez à déléguer, pratiquez l'assertivité (dire non quand nécessaire), prenez des pauses régulières, maintenez une activité physique, cultivez des relations sociales épanouissantes, et pratiquez des techniques de gestion du stress. Si vous sentez les premiers signes : parlez-en rapidement, consultez un médecin, envisagez un arrêt de travail si nécessaire."
        },
        {
          title: "Le chemin de la récupération",
          content: "La guérison du burn-out nécessite généralement : un arrêt de travail adapté (de quelques semaines à plusieurs mois), un accompagnement psychologique (TCC, thérapie d'acceptation et d'engagement), parfois un traitement médicamenteux pour les symptômes anxieux ou dépressifs, une réorganisation progressive avec retour graduel au travail, et souvent un changement dans les conditions de travail ou le poste. La récupération complète peut prendre de 6 mois à 2 ans."
        }
      ],
      conclusion: "Le burn-out est un signal d'alarme indiquant que quelque chose doit changer. Ce n'est ni une faiblesse ni un échec personnel, mais la conséquence d'une situation professionnelle devenue insoutenable. Avec un accompagnement adapté et des changements concrets, il est possible de se reconstruire et de retrouver un équilibre de vie satisfaisant.",
      resources: [
        { title: "Médecine du travail", url: "tel:71783522" },
        { title: "Soutien psychologique", url: "tel:80101919" }
      ]
    }
  },
  {
    slug: "gestion-stress-techniques-efficaces",
    title: "Gestion du stress : techniques efficaces",
    description: "Le stress fait partie de la vie moderne, mais il ne doit pas la dominer. Découvrez des stratégies concrètes pour mieux le gérer.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&q=80",
    category: "Bien-être",
    author: "Équipe Theramind",
    date: "28 octobre 2024",
    readTime: "7 min",
    content: {
      introduction: "Le stress est une réponse naturelle de l'organisme face à une situation perçue comme menaçante ou exigeante. Si un stress ponctuel peut être stimulant, un stress chronique a des effets délétères sur la santé physique et mentale. Heureusement, des techniques éprouvées permettent de le gérer efficacement.",
      sections: [
        {
          title: "Comprendre le mécanisme du stress",
          content: "Face à un stresseur, notre corps active la réaction « combat ou fuite » : libération de cortisol et d'adrénaline, augmentation du rythme cardiaque, tension musculaire, mobilisation de l'énergie. Cette réaction est utile face à un danger immédiat, mais problématique lorsqu'elle s'active constamment. Le stress chronique perturbe le sommeil, affaiblit le système immunitaire, augmente le risque cardiovasculaire, et favorise anxiété et dépression."
        },
        {
          title: "Techniques de respiration anti-stress",
          content: "La respiration est l'outil le plus accessible pour calmer instantanément le système nerveux. Respiration abdominale : posez une main sur votre ventre, inspirez profondément par le nez en gonflant le ventre (4 secondes), retenez (4 secondes), expirez lentement par la bouche (6 secondes). Répétez 5-10 fois. La cohérence cardiaque (6 respirations par minute pendant 5 minutes) régule le système nerveux autonome. Pratiquez 3 fois par jour pour des effets durables."
        },
        {
          title: "L'activité physique comme régulateur",
          content: "L'exercice est l'un des meilleurs anti-stress naturels. Il libère des endorphines (hormones du bien-être), réduit le cortisol, améliore le sommeil, booste la confiance en soi. Pas besoin d'être un athlète : 30 minutes de marche rapide, du vélo, de la natation, du yoga, ou simplement danser chez soi suffisent. L'important est la régularité : 3 à 5 fois par semaine. Trouvez une activité que vous aimez pour la maintenir dans la durée."
        },
        {
          title: "Gérer son temps et ses priorités",
          content: "Beaucoup de stress vient d'une mauvaise gestion du temps. Techniques efficaces : la méthode Eisenhower (urgent/important), la technique Pomodoro (25 min de travail, 5 min de pause), apprendre à dire non, déléguer quand possible, éviter le multitâche (qui augmente le stress et réduit l'efficacité), planifier des moments de pause, et accepter que tout ne peut pas être fait parfaitement. Fixez-vous des objectifs réalistes et célébrez vos accomplissements."
        },
        {
          title: "Le soutien social et l'expression émotionnelle",
          content: "Nous sommes des êtres sociaux, et le soutien d'autrui est un puissant tampon contre le stress. Parlez de ce qui vous préoccupe à un ami, un proche, ou un professionnel. Rejoignez des groupes partageant vos intérêts. Exprimez vos émotions plutôt que de les refouler : par l'écriture (journal), l'art, la musique, ou simplement en verbalisant. L'humour est aussi un excellent outil : rire réduit les hormones du stress et libère des endorphines."
        }
      ],
      conclusion: "La gestion du stress est une compétence qui s'apprend et se perfectionne avec la pratique. Expérimentez différentes techniques pour trouver celles qui vous conviennent. N'attendez pas d'être submergé pour agir : la prévention est toujours plus efficace que le traitement d'un stress chronique installé.",
      resources: [
        { title: "Exercices de relaxation Theramind", url: "/activities" },
        { title: "Suivi de l'humeur", url: "/dashboard" }
      ]
    }
  },
  {
    slug: "sante-mentale-ressources-soutien",
    title: "Santé mentale : ressources et soutien",
    description: "Guide complet des ressources disponibles en Tunisie pour le soutien psychologique et la santé mentale.",
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1200&h=600&fit=crop&q=80",
    category: "Ressources",
    author: "Équipe Theramind",
    date: "25 octobre 2024",
    readTime: "10 min",
    content: {
      introduction: "La santé mentale est aussi importante que la santé physique. Pourtant, beaucoup hésitent encore à demander de l'aide par méconnaissance des ressources disponibles ou par crainte du jugement. Ce guide vise à recenser les principales ressources accessibles en Tunisie et à encourager la démarche de soin.",
      sections: [
        {
          title: "Les services publics de santé mentale",
          content: "En Tunisie, plusieurs structures publiques offrent des consultations psychiatriques et psychologiques : les hôpitaux universitaires (Razi, Manouba, Mongi Slim), les centres de santé de base (CSB) avec des consultations en santé mentale, les services de psychiatrie dans les hôpitaux régionaux. Les tarifs sont très accessibles (quelques dinars par consultation). Les Centres de Santé Mentale Communautaire (CSMC) proposent un suivi ambulatoire avec équipes pluridisciplinaires."
        },
        {
          title: "Le secteur privé et les associations",
          content: "Pour ceux qui préfèrent le secteur privé : psychiatres et psychologues en cabinet (tarifs variables de 40 à 150 DT), centres privés de santé mentale, téléconsultations. Associations actives : Tunisian Association for Mental Health, Association Tunisienne de Prévention Positive (prévention du suicide), SOS Villages d'Enfants (soutien enfance), nombreuses associations locales proposant écoute et orientation. Certaines associations offrent des consultations gratuites ou à tarif solidaire."
        },
        {
          title: "Les lignes d'écoute et d'urgence",
          content: "Numéros essentiels à connaître : 80 10 19 19 (ligne d'écoute nationale santé mentale, gratuite et confidentielle), 71 56 13 29 (urgences psychiatriques Razi), 71 78 35 22 (médecine du travail et prévention), 197 (SAMU), 190 (Police secours). Ces lignes fonctionnent 24h/24 et 7j/7 pour les urgences. N'hésitez jamais à appeler en cas de détresse aiguë ou de pensées suicidaires."
        },
        {
          title: "Les outils numériques et l'e-santé mentale",
          content: "Les applications de santé mentale se développent : Theramind (notre plateforme avec IA thérapeutique, suivi d'humeur, exercices), applications de méditation (Petit Bambou, Calm, Headspace), applications de TCC, forums de soutien en ligne (modérés par des professionnels). Attention : ces outils complètent mais ne remplacent pas un suivi professionnel en cas de troubles sévères. Vérifiez toujours la qualité et la confidentialité des plateformes utilisées."
        },
        {
          title: "Comment franchir le pas de la consultation",
          content: "Reconnaître qu'on a besoin d'aide est une force. Si vous hésitez : parlez-en d'abord à votre médecin traitant qui pourra vous orienter, contactez une ligne d'écoute pour un premier échange, consultez les avis sur les professionnels, préparez votre première consultation (notez vos symptômes, leur durée, leur impact), sachez qu'il est normal de devoir consulter plusieurs professionnels avant de trouver le bon. La thérapie est un investissement en vous-même, et les résultats en valent la peine."
        }
      ],
      conclusion: "Les ressources en santé mentale existent et sont plus accessibles qu'on ne le pense. Que vous traversiez une période difficile ou souffriez d'un trouble mental, des solutions existent. N'attendez pas que la situation empire : plus la prise en charge est précoce, plus elle est efficace. Prendre soin de sa santé mentale est un acte de courage et de responsabilité envers soi-même.",
      resources: [
        { title: "Ligne nationale : 80 10 19 19", url: "tel:80101919" },
        { title: "Urgences Razi : 71 56 13 29", url: "tel:71561329" },
        { title: "SAMU : 197", url: "tel:197" },
        { title: "Theramind - Commencer", url: "/signup" }
      ]
    }
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(article => article.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  return articles.filter(article => article.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(articles.map(article => article.category)));
}
