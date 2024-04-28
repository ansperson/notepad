import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Learning',
    Svg: require('@site/static/img/learn.svg').default,
    description: (
      <>
        My study workbook for trainings.
      </>
    ),
    link: `/notepad/docs/az-104`
  },
  {
    title: 'Blog',
    Svg: require('@site/static/img/blog.svg').default,
    description: (
      <>
        Some thoughts and ideas.
      </>
    ),
    link: `/notepad/blog`
  },
  {
    title: 'About',
    Svg: require('@site/static/img/about.svg').default,
    description: (
      <>
        About me.
      </>
    ),
  },
];

function Feature({Svg, title, description, link}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
          <a href={link}>{title}</a> {/* Wrap the title with an anchor tag */}
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
