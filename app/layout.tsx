import './globals.css';
import {DemoProvider} from '@/components/DemoProvider';
export const metadata={title:'FairShift | Fair work, made visible',description:'Workforce fairness platform for India'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><DemoProvider>{children}</DemoProvider></body></html>}
