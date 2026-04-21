import React from 'react';
import  { Redirect } from 'react-router-dom';

export default function Home() {
  return <Redirect to='/docs/all_video_tutorials' />;
}