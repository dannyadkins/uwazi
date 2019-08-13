import { Link } from 'react-router';

import { Icon } from 'UI';

import BarChart from './BarChart';
import Counter from './Counter';
import ContactForm from './ContactForm';
import EntityLink from './EntityLink';
import ItemList from './ItemList';
import Repeat from './Repeat';
import Context from './Context';
import Connect from './Connect';
import Slideshow from './Slideshow';
import Map from './Map';
import MarkdownLink from './MarkdownLink';
import PayPalDonateLink from './PayPalDonateLink';
import PublicForm from './PublicForm';
import MarkdownMedia from './MarkdownMedia';
import PieChart from './PieChart';
import ListChart from './ListChart';
import GaugeChart from './GaugeChart';
import Value from './Value';
import SearchBox from './SearchBox';
import EntityInfo from './EntityInfo';
import ChartData from './ChartData';
import * as recharts from 'recharts';

export default {
  MarkdownMedia,
  ContactForm,
  Context,
  Connect,
  EntityLink,
  ItemList,
  Slideshow,
  MarkdownLink,
  PayPalDonateLink,
  PublicForm,
  SearchBox,
  Counter,
  BarChart,
  PieChart,
  ListChart,
  Repeat,
  GaugeChart,
  Value,
  Icon,
  Map,
  Link,
  EntityInfo,
  ChartData,
  ...recharts
};
